import '@tensorflow/tfjs-backend-webgl';
import '@tensorflow/tfjs-backend-cpu';
import { ModelConfig, PersonInferenceConfig } from '@tensorflow-models/body-pix/dist/body_pix_model';
import { BodyPix, load as loadModel } from '@tensorflow-models/body-pix';
import { Processor } from '../Processor';
import { Benchmark } from '../../utils/Benchmark';
import { Dimensions } from '../../types';

import {
  BODYPIX_INFERENCE_DIMENSIONS,
  DEBOUNCE,
  HISTORY_COUNT,
  INFERENCE_CONFIG,
  MASK_BLUR_RADIUS,
  MODEL_CONFIG,
  MODEL_NAME,
  PERSON_PROBABILITY_THRESHOLD,
  TFLITE_LOADER_NAME,
  TFLITE_LOADER_NAME_SIMD,
  WASM_INFERENCE_DIMENSIONS,
} from '../../constants';

/**
 * @private
 */
export interface BackgroundProcessorOptions {
  /**
   * The VideoProcessors load assets dynamically depending on certain browser features.
   * You need to serve all the assets and provide the root path so they can be referenced by the SDK.
   * These assets can be copied from the `dist/build` folder which you can add as part of your deployment process.
   * @example
   * ```ts
   * const virtualBackground = new VirtualBackgroundProcessor({
   *   assetsPath: 'https://my-server-path/assets',
   *   backgroundImage: img,
   * });
   * await virtualBackground.loadModel();
   * ```
   */
  assetsPath: string;

  /**
   * @private
   */
  debounce?: number;

  /**
   * @private
   */
  historyCount?: number;

  /**
   * @private
   */
  inferenceConfig?: PersonInferenceConfig;

  /**
   * @private
   */
  inferenceDimensions?: Dimensions;

  /**
   * The blur radius to use when smoothing out the edges of the person's mask.
   * @default
   * ```html
   * 3
   * ```
   */
  maskBlurRadius?: number;

  /**
   * @private
   */
  personProbabilityThreshold?: number;

  /**
   * @private
   */
   useWasm?: boolean;
}

/**
 * @private
 */
export abstract class BackgroundProcessor extends Processor {
  private static _model: BodyPix | null = null;
  private static async _loadModel(config: ModelConfig = MODEL_CONFIG): Promise<void> {
    BackgroundProcessor._model = await loadModel(config)
      .catch((error: any) => console.error('Unable to load model.', error)) || null;
  }
  protected _outputCanvas: HTMLCanvasElement;
  protected _outputContext: CanvasRenderingContext2D;

  private _assetsPath: string;
  private _benchmark: Benchmark;
  private _currentMask: Uint8ClampedArray | Uint8Array = new Uint8ClampedArray();
  private _debounce: number = DEBOUNCE;
  private _dummyImageData: ImageData = new ImageData(1, 1);
  private _historyCount: number = HISTORY_COUNT;
  private _inferenceConfig: PersonInferenceConfig = INFERENCE_CONFIG;
  private _inferenceDimensions: Dimensions = WASM_INFERENCE_DIMENSIONS;
  private _inputCanvas: HTMLCanvasElement;
  private _inputContext: CanvasRenderingContext2D;
  private _inputMemoryOffset: number = 0;
  private _maskBlurRadius: number = MASK_BLUR_RADIUS;
  private _maskCanvas: OffscreenCanvas;
  private _maskContext: OffscreenCanvasRenderingContext2D;
  private _masks: (Uint8ClampedArray | Uint8Array)[];
  private _maskUsageCounter: number = 0;
  private _outputMemoryOffset: number = 0;
  private _personProbabilityThreshold: number = PERSON_PROBABILITY_THRESHOLD;
  private _tflite: any;
  private _useWasm: boolean;

  constructor(options: BackgroundProcessorOptions) {
    super();

    if (typeof options.assetsPath !== 'string') {
      throw new Error('assetsPath parameter is missing');
    }
    let assetsPath = options.assetsPath;
    if (assetsPath && assetsPath[assetsPath.length - 1] !== '/') {
      assetsPath += '/';
    }

    this.maskBlurRadius = options.maskBlurRadius!;
    this._assetsPath = assetsPath;
    this._debounce = options.debounce! || DEBOUNCE;
    this._historyCount = options.historyCount! || HISTORY_COUNT;
    this._inferenceConfig = options.inferenceConfig! || INFERENCE_CONFIG;
    this._personProbabilityThreshold = options.personProbabilityThreshold! || PERSON_PROBABILITY_THRESHOLD;
    this._useWasm = typeof options.useWasm === 'boolean' ? options.useWasm : true;
    this._inferenceDimensions = options.inferenceDimensions! ||
      (this._useWasm ? WASM_INFERENCE_DIMENSIONS : BODYPIX_INFERENCE_DIMENSIONS);

    this._benchmark = new Benchmark();
    this._inputCanvas = document.createElement('canvas');
    this._inputContext = this._inputCanvas.getContext('2d') as CanvasRenderingContext2D;
    this._maskCanvas = new OffscreenCanvas(1, 1);
    this._maskContext = this._maskCanvas.getContext('2d') as OffscreenCanvasRenderingContext2D;
    this._outputCanvas = document.createElement('canvas');
    this._outputContext = this._outputCanvas.getContext('2d') as CanvasRenderingContext2D;
    this._masks = [];
  }

  /**
   * The current blur radius when smoothing out the edges of the person's mask.
   */
  get maskBlurRadius(): number {
    return this._maskBlurRadius;
  }

  /**
   * Set a new blur radius to be used when smoothing out the edges of the person's mask.
   */
  set maskBlurRadius(radius: number) {
    if (typeof radius !== 'number' || radius < 0) {
      console.warn(`Valid mask blur radius not found. Using ${MASK_BLUR_RADIUS} as default.`);
      radius = MASK_BLUR_RADIUS;
    }
    this._maskBlurRadius = radius;
  }

  /**
   * Load the segmentation model.
   * Call this method before attaching the processor to ensure
   * video frames are processed correctly.
   */
   async loadModel() {
    const [, tflite, modelResponse ] = await Promise.all([
      BackgroundProcessor._loadModel(),
      this._loadTwilioTfLite(),
      fetch(this._assetsPath + MODEL_NAME),
    ]);

    const model = await modelResponse.arrayBuffer();
    const modelBufferOffset = tflite._getModelBufferMemoryOffset();
    tflite.HEAPU8.set(new Uint8Array(model), modelBufferOffset);
    tflite._loadModel(model.byteLength);

    this._inputMemoryOffset = tflite._getInputMemoryOffset() / 4;
    this._outputMemoryOffset = tflite._getOutputMemoryOffset() / 4;

    this._tflite = tflite;
  }

  /**
   * Apply a transform to the background of an input video frame and leaving
   * the foreground (person(s)) untouched. Any exception detected will
   * result in the frame being dropped.
   * @param inputFrameBuffer - The source of the input frame to process.
   * @param outputFrameBuffer - The output frame buffer to use to draw the processed frame.
   */
  async processFrame(inputFrameBuffer: OffscreenCanvas, outputFrameBuffer: HTMLCanvasElement): Promise<void> {
    if (!BackgroundProcessor._model || !this._tflite) {
      return;
    }
    if (!inputFrameBuffer || !outputFrameBuffer) {
      throw new Error('Missing input or output frame buffer');
    }
    this._benchmark.end('processFrame(jsdk)');
    this._benchmark.start('processFrame(processor)');

    const inputFrame = inputFrameBuffer;
    const { width: captureWidth, height: captureHeight } = inputFrame;
    const { width: inferenceWidth, height: inferenceHeight } = this._inferenceDimensions;

    if (this._outputCanvas !== outputFrameBuffer) {
      this._outputCanvas = outputFrameBuffer;
      this._outputContext = outputFrameBuffer.getContext('2d') as CanvasRenderingContext2D;
    }

    // Only set the canvas' dimensions if they have changed to prevent unnecessary redraw
    let reInitDummyImage = false;
    if (this._inputCanvas.width !== inferenceWidth) {
      this._inputCanvas.width = inferenceWidth;
      this._maskCanvas.width = inferenceWidth;
      reInitDummyImage = true;
    }
    if (this._inputCanvas.height !== inferenceHeight) {
      this._inputCanvas.height = inferenceHeight;
      this._maskCanvas.height = inferenceHeight;
      reInitDummyImage = true;
    }
    if (reInitDummyImage) {
      this._dummyImageData = new ImageData(
        new Uint8ClampedArray(inferenceWidth * inferenceHeight * 4),
        inferenceWidth, inferenceHeight);
    }

    const personMask = await this._createPersonMask(inputFrame);

    this._benchmark.start('imageCompositing');
    this._maskContext.putImageData(personMask, 0, 0);
    this._outputContext.save();
    this._outputContext.filter = `blur(${this._maskBlurRadius}px)`;
    this._outputContext.globalCompositeOperation = 'copy';
    this._outputContext.drawImage(this._maskCanvas, 0, 0, captureWidth, captureHeight);
    this._outputContext.filter = 'none';
    this._outputContext.globalCompositeOperation = 'source-in';
    this._outputContext.drawImage(inputFrame, 0, 0, captureWidth, captureHeight);
    this._outputContext.globalCompositeOperation = 'destination-over';
    this._setBackground(inputFrame);
    this._outputContext.restore();

    this._benchmark.end('imageCompositing');
    this._benchmark.end('processFrame(processor)');
    this._benchmark.end('processFrame');

    // NOTE (csantos): Start the benchmark from here so we can include the delay from the Video sdk
    // for a more accurate fps
    this._benchmark.start('processFrame');
    this._benchmark.start('processFrame(jsdk)');
  }

  protected abstract _setBackground(inputFrame: OffscreenCanvas): void;

  private _addMask(mask: Uint8ClampedArray | Uint8Array) {
    if (this._masks.length >= this._historyCount) {
      this._masks.splice(0, this._masks.length - this._historyCount + 1);
    }
    this._masks.push(mask);
  }

  private _applyAlpha(imageData: ImageData) {
    const weightedSum = this._masks.reduce((sum, mask, j) => sum + (j + 1) * (j + 1), 0);
    const pixels = imageData.height * imageData.width;
    for (let i = 0; i < pixels; i++) {
      const w = this._masks.reduce((sum, mask, j) => sum + mask[i] * (j + 1) * (j + 1), 0) / weightedSum;
      imageData.data[i * 4 + 3] = Math.round(w * 255);
    }
  }

  private async _createPersonMask(inputFrame: OffscreenCanvas): Promise<ImageData> {
    let imageData = this._dummyImageData;
    const shouldRunInference = this._maskUsageCounter < 1;

    this._benchmark.start('resizeInputImage');
    if (shouldRunInference) {
      imageData = this._getResizedInputImageData(inputFrame);
    }
    this._benchmark.end('resizeInputImage');

    this._benchmark.start('segmentPerson');
    if (shouldRunInference) {
      this._currentMask = this._useWasm
        ? this._runTwilioTfLiteInference(imageData)
        : await this._runBodyPixInference(imageData);
      this._maskUsageCounter = this._debounce;
    }
    this._addMask(this._currentMask);
    this._applyAlpha(imageData);
    this._maskUsageCounter--;
    this._benchmark.end('segmentPerson');

    return imageData;
  }

  private _getResizedInputImageData(inputFrame: OffscreenCanvas): ImageData {
    const { width, height } = this._inputCanvas;
    this._inputContext.drawImage(inputFrame, 0, 0, width, height);
    const imageData = this._inputContext.getImageData(0, 0, width, height);
    return imageData;
  }

  private _loadJs(url: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.onload = () => resolve();
      script.onerror = reject;
      document.head.append(script);
      script.src = url;
    });
  }

  private async _loadTwilioTfLite(): Promise<any> {
    let tflite: any;
    await this._loadJs(this._assetsPath + TFLITE_LOADER_NAME_SIMD);

    try {
      tflite = await window.createTwilioTFLiteSIMDModule();
    } catch {
      console.warn('SIMD not supported. You may experience poor quality of background replacement.');
      await this._loadJs(this._assetsPath + TFLITE_LOADER_NAME);
      tflite = await window.createTwilioTFLiteModule();
    }
    return tflite;
  }

  private async _runBodyPixInference(inputImage: ImageData): Promise<Uint8Array> {
    const segment = await BackgroundProcessor._model!.segmentPerson(inputImage, this._inferenceConfig);
    return segment.data;
  }

  private _runTwilioTfLiteInference(inputImage: ImageData): Uint8ClampedArray {
    const { _inferenceDimensions: { width, height }, _inputMemoryOffset: offset, _tflite: tflite } = this;
    const pixels = width * height;

    for (let i = 0; i < pixels; i++) {
      tflite.HEAPF32[offset + i * 3] = inputImage.data[i * 4] / 255;
      tflite.HEAPF32[offset + i * 3 + 1] = inputImage.data[i * 4 + 1] / 255;
      tflite.HEAPF32[offset + i * 3 + 2] = inputImage.data[i * 4 + 2] / 255;
    }

    tflite._runInference();
    const inferenceData = new Uint8ClampedArray(pixels * 4);

    for (let i = 0; i < pixels; i++) {
      const personProbability = tflite.HEAPF32[this._outputMemoryOffset + i];
      inferenceData[i] = Number(personProbability >= this._personProbabilityThreshold) * personProbability;
    }

    return inferenceData;
  }
}

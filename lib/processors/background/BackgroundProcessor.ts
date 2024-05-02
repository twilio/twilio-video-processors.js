import { Processor } from '../Processor';
import { Benchmark } from '../../utils/Benchmark';
import { version } from '../../utils/version';
import { Dimensions, Pipeline, WebGL2PipelineType } from '../../types';
import { buildWebGL2Pipeline } from '../webgl2';

import {
  DEBOUNCE_COUNT,
  HISTORY_COUNT_MULTIPLIER,
  MASK_BLUR_RADIUS,
  MODEL_NAME,
  PERSON_PROBABILITY_THRESHOLD,
  TFLITE_LOADER_NAME,
  TFLITE_SIMD_LOADER_NAME,
  WASM_INFERENCE_DIMENSIONS,
} from '../../constants';

/**
 * @private
 */
export interface BackgroundProcessorOptions {
  /**
   * The VideoProcessors load assets dynamically depending on certain browser features.
   * You need to serve all the assets and provide the root path so they can be referenced properly.
   * These assets can be copied from the `dist/build` folder which you can add as part of your deployment process.
   * @example
   * <br/>
   * <br/>
   * For virtual background:
   * <br/>
   *
   * ```ts
   * const virtualBackground = new VirtualBackgroundProcessor({
   *   assetsPath: 'https://my-server-path/assets',
   *   backgroundImage: img,
   * });
   * await virtualBackground.loadModel();
   * ```
   *
   * <br/>
   * For blur background:
   * <br/>
   *
   * ```ts
   * const blurBackground = new GaussianBlurBackgroundProcessor({
   *   assetsPath: 'https://my-server-path/assets'
   * });
   * await blurBackground.loadModel();
   * ```
   */
  assetsPath: string;

  /**
   * Whether to skip processing every other frame to improve the output frame rate, but reducing accuracy in the process.
   * @default
   * ```html
   * true
   * ```
   */
  debounce?: boolean;

  /**
   * @private
   */
  inferenceDimensions?: Dimensions;

  /**
   * The blur radius to use when smoothing out the edges of the person's mask.
   * @default
   * ```html
   * 5
   * ```
   */
  maskBlurRadius?: number;

  /**
   * @private
   */
  personProbabilityThreshold?: number;

  /**
   * Specifies which pipeline to use when processing video frames.
   * @default
   * ```html
   * 'WebGL2'
   * ```
   */
  pipeline?: Pipeline;
}

/**
 * @private
 */
export abstract class BackgroundProcessor extends Processor {
  private static _loadedScripts: string[] = [];

  protected _backgroundImage: HTMLImageElement | null = null;
  protected _outputCanvas: HTMLCanvasElement | null = null;
  protected _outputContext: CanvasRenderingContext2D | WebGL2RenderingContext | null = null;
  protected _webgl2Pipeline: ReturnType<typeof buildWebGL2Pipeline> | null = null;

  private _assetsPath: string;
  private _benchmark: Benchmark;
  private _currentMask: Uint8ClampedArray | Uint8Array = new Uint8ClampedArray();
  private _debounce: boolean = true;
  private _debounceCount: number = DEBOUNCE_COUNT;
  private _dummyImageData: ImageData = new ImageData(1, 1);
  private _historyCount: number;
  private _inferenceDimensions: Dimensions = WASM_INFERENCE_DIMENSIONS;
  private _inputCanvas: HTMLCanvasElement;
  private _inputContext: CanvasRenderingContext2D;
  private _inputMemoryOffset: number = 0;
  // tslint:disable-next-line no-unused-variable
  private _isSimdEnabled: boolean | null = null;
  private _maskBlurRadius: number = MASK_BLUR_RADIUS;
  private _maskCanvas: OffscreenCanvas | HTMLCanvasElement;
  private _maskContext: OffscreenCanvasRenderingContext2D | CanvasRenderingContext2D;
  private _masks: (Uint8ClampedArray | Uint8Array)[];
  private _maskUsageCounter: number = 0;
  private _outputMemoryOffset: number = 0;
  private _personProbabilityThreshold: number = PERSON_PROBABILITY_THRESHOLD;
  private _pipeline: Pipeline = Pipeline.WebGL2;
  private _tflite: any;
  // tslint:disable-next-line no-unused-variable
  private readonly _version: string = version;

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
    this._debounce = typeof options.debounce === 'boolean' ? options.debounce : this._debounce;
    this._debounceCount = this._debounce ? this._debounceCount : 1;
    this._inferenceDimensions = options.inferenceDimensions! || this._inferenceDimensions;
    this._historyCount = HISTORY_COUNT_MULTIPLIER * this._debounceCount;
    this._personProbabilityThreshold = options.personProbabilityThreshold! || this._personProbabilityThreshold;
    this._pipeline = options.pipeline! || this._pipeline;

    this._benchmark = new Benchmark();
    this._inputCanvas = document.createElement('canvas');
    this._inputContext = this._inputCanvas.getContext('2d') as CanvasRenderingContext2D;
    this._maskCanvas =  typeof window.OffscreenCanvas !== 'undefined' ? new window.OffscreenCanvas(1, 1) : document.createElement('canvas');
    this._maskContext = this._maskCanvas.getContext('2d') as OffscreenCanvasRenderingContext2D;
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
    const [tflite, modelResponse ] = await Promise.all([
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
   * <br/>
   * <br/>
   * [OffscreenCanvas](https://developer.mozilla.org/en-US/docs/Web/API/OffscreenCanvas) - Good for canvas-related processing
   * that can be rendered off screen. Only works when using [[Pipeline.Canvas2D]].
   * <br/>
   * <br/>
   * [HTMLCanvasElement](https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement) - This is recommended on browsers
   * that doesn't support `OffscreenCanvas`, or if you need to render the frame on the screen. Only works when using [[Pipeline.Canvas2D]].
   * <br/>
   * <br/>
   * [HTMLVideoElement](https://developer.mozilla.org/en-US/docs/Web/API/HTMLVideoElement) - Recommended when using [[Pipeline.WebGL2]] but
   * works for both [[Pipeline.Canvas2D]] and [[Pipeline.WebGL2]].
   * <br/>
   * @param outputFrameBuffer - The output frame buffer to use to draw the processed frame.
   */
  async processFrame(
    inputFrameBuffer: OffscreenCanvas | HTMLCanvasElement | HTMLVideoElement,
    outputFrameBuffer: HTMLCanvasElement
  ): Promise<void> {
    if (!this._tflite) {
      return;
    }
    if (!inputFrameBuffer || !outputFrameBuffer) {
      throw new Error('Missing input or output frame buffer');
    }
    this._benchmark.end('captureFrameDelay');
    this._benchmark.start('processFrameDelay');

    const { width: inferenceWidth, height: inferenceHeight } = this._inferenceDimensions;
    let inputFrame = inputFrameBuffer;
    let { width: captureWidth, height: captureHeight } = inputFrame;
    if ((inputFrame as HTMLVideoElement).videoWidth) {
      inputFrame = inputFrame as HTMLVideoElement;
      captureWidth = inputFrame.videoWidth;
      captureHeight = inputFrame.videoHeight;
    }
    if (this._outputCanvas !== outputFrameBuffer) {
      this._outputCanvas = outputFrameBuffer;
      this._outputContext = this._outputCanvas
        .getContext(this._pipeline === Pipeline.Canvas2D ? '2d' : 'webgl2') as
        CanvasRenderingContext2D | WebGL2RenderingContext;
      this._webgl2Pipeline?.cleanUp();
      this._webgl2Pipeline = null;
    }

    if (!this._webgl2Pipeline && this._pipeline === Pipeline.WebGL2) {
      this._createWebGL2Pipeline(inputFrame as HTMLVideoElement, captureWidth, captureHeight, inferenceWidth, inferenceHeight);
    }

    if (this._pipeline === Pipeline.WebGL2) {
      await this._webgl2Pipeline?.render();
    } else {
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
      const ctx = this._outputContext as CanvasRenderingContext2D;
      this._benchmark.start('imageCompositionDelay');
      this._maskContext.putImageData(personMask, 0, 0);
      ctx.save();
      ctx.filter = `blur(${this._maskBlurRadius}px)`;
      ctx.globalCompositeOperation = 'copy';
      ctx.drawImage(this._maskCanvas, 0, 0, captureWidth, captureHeight);
      ctx.filter = 'none';
      ctx.globalCompositeOperation = 'source-in';
      ctx.drawImage(inputFrame, 0, 0, captureWidth, captureHeight);
      ctx.globalCompositeOperation = 'destination-over';
      this._setBackground(inputFrame);
      ctx.restore();
      this._benchmark.end('imageCompositionDelay');
    }

    this._benchmark.end('processFrameDelay');
    this._benchmark.end('totalProcessingDelay');

    // NOTE (csantos): Start the benchmark from here so we can include the delay from the Video sdk
    // for a more accurate fps
    this._benchmark.start('totalProcessingDelay');
    this._benchmark.start('captureFrameDelay');
  }

  protected abstract _getWebGL2PipelineType(): WebGL2PipelineType;

  protected abstract _setBackground(inputFrame: OffscreenCanvas | HTMLCanvasElement | HTMLVideoElement): void;

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

  private async _createPersonMask(inputFrame: OffscreenCanvas | HTMLCanvasElement | HTMLVideoElement): Promise<ImageData> {
    let imageData = this._dummyImageData;
    const shouldRunInference = this._maskUsageCounter < 1;

    this._benchmark.start('inputImageResizeDelay');
    if (shouldRunInference) {
      imageData = this._getResizedInputImageData(inputFrame);
    }
    this._benchmark.end('inputImageResizeDelay');

    this._benchmark.start('segmentationDelay');
    if (shouldRunInference) {
      this._currentMask = this._runTwilioTfLiteInference(imageData);
      this._maskUsageCounter = this._debounceCount;
    }
    this._addMask(this._currentMask);
    this._applyAlpha(imageData);
    this._maskUsageCounter--;
    this._benchmark.end('segmentationDelay');

    return imageData;
  }

  private _createWebGL2Pipeline(
    inputFrame: HTMLVideoElement,
    captureWidth: number,
    captureHeight: number,
    inferenceWidth: number,
    inferenceHeight: number,
  ): void {
    this._webgl2Pipeline = buildWebGL2Pipeline(
      inputFrame,
      { inputResolution: `${inferenceWidth}x${inferenceHeight}` },
      this._outputCanvas!,
      this._tflite,
      this._benchmark
    );
  }

  private _getResizedInputImageData(inputFrame: OffscreenCanvas | HTMLCanvasElement | HTMLVideoElement): ImageData {
    const { width, height } = this._inputCanvas;
    this._inputContext.drawImage(inputFrame, 0, 0, width, height);
    const imageData = this._inputContext.getImageData(0, 0, width, height);
    return imageData;
  }

  private _loadJs(url: string): Promise<void> {
    if (BackgroundProcessor._loadedScripts.includes(url)) {
      return Promise.resolve();
    }
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.onload = () => {
        BackgroundProcessor._loadedScripts.push(url);
        resolve();
      };
      script.onerror = reject;
      document.head.append(script);
      script.src = url;
    });
  }

  private async _loadTwilioTfLite(): Promise<any> {
    let tflite: any;
    await this._loadJs(this._assetsPath + TFLITE_SIMD_LOADER_NAME);

    try {
      tflite = await window.createTwilioTFLiteSIMDModule();
      this._isSimdEnabled = true;
    } catch {
      console.warn('SIMD not supported. You may experience poor quality of background replacement.');
      await this._loadJs(this._assetsPath + TFLITE_LOADER_NAME);
      tflite = await window.createTwilioTFLiteModule();
      this._isSimdEnabled = false;
    }
    return tflite;
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

import { Processor } from '../Processor';
import { Benchmark } from '../../utils/Benchmark';
import { version } from '../../utils/version';
import { Dimensions, Pipeline, WebGL2PipelineType } from '../../types';
import { buildWebGL2Pipeline, buildWebGL2ResizePipeline } from '../webgl2';

import {
  MASK_BLUR_RADIUS,
  MODEL_NAME,
  PERSON_PROBABILITY_THRESHOLDS,
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
  protected _webgl2ResizePipeline: ReturnType<typeof buildWebGL2ResizePipeline> | null = null;

  private _assetsPath: string;
  private _benchmark: Benchmark;
  private _debounce: boolean = true;
  private _inferenceDimensions: Dimensions = WASM_INFERENCE_DIMENSIONS;
  private _inputCanvas: HTMLCanvasElement;
  // tslint:disable-next-line no-unused-variable
  private _isSimdEnabled: boolean | null = null;
  private _maskBlurRadius: number = MASK_BLUR_RADIUS;
  private _maskCanvas: OffscreenCanvas | HTMLCanvasElement;
  private _maskContext: OffscreenCanvasRenderingContext2D | CanvasRenderingContext2D;
  private _outputMemoryOffset: number = 0;
  private _personMask: ImageData | null = null;
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
    this._inferenceDimensions = options.inferenceDimensions! || this._inferenceDimensions;
    this._pipeline = options.pipeline! || this._pipeline;

    this._benchmark = new Benchmark();
    this._inputCanvas = document.createElement('canvas');
    this._maskCanvas =  typeof window.OffscreenCanvas !== 'undefined' ? new window.OffscreenCanvas(1, 1) : document.createElement('canvas');
    this._maskContext = this._maskCanvas.getContext('2d') as OffscreenCanvasRenderingContext2D;
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
   * @private
   */
   async loadModel() {
    const [tflite, modelResponse] = await Promise.all([
      this._loadTwilioTfLite(),
      fetch(this._assetsPath + MODEL_NAME),
    ]);
    const model = await modelResponse.arrayBuffer();
    const modelBufferOffset = tflite._getModelBufferMemoryOffset();
    tflite.HEAPU8.set(new Uint8Array(model), modelBufferOffset);
    tflite._loadModel(model.byteLength);
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
   * @private
   */
  processFrame(
    inputFrameBuffer: OffscreenCanvas | HTMLCanvasElement | HTMLVideoElement,
    outputFrameBuffer: HTMLCanvasElement
  ): void {
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
    } else if (!this._webgl2ResizePipeline && this._pipeline === Pipeline.Canvas2D) {
      this._createWebGL2ResizePipeline(inputFrame as HTMLVideoElement, captureWidth, captureHeight, inferenceWidth, inferenceHeight);
    }

    if (this._pipeline === Pipeline.WebGL2) {
      this._webgl2Pipeline?.render();
    } else {
      // Only set the canvas' dimensions if they have changed to prevent unnecessary redraw
      if (this._inputCanvas.width !== inferenceWidth) {
        this._inputCanvas.width = inferenceWidth;
        this._maskCanvas.width = inferenceWidth;
      }
      if (this._inputCanvas.height !== inferenceHeight) {
        this._inputCanvas.height = inferenceHeight;
        this._maskCanvas.height = inferenceHeight;
      }

      const personMask = this._personMask || this._createPersonMask();
      const ctx = this._outputContext as CanvasRenderingContext2D;
      this._benchmark.start('imageCompositionDelay');
      if (!this._personMask) {
        this._maskContext.putImageData(personMask, 0, 0);
      }
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

      if (this._debounce) {
        this._personMask = this._personMask ? null : personMask;
      }
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

  private _applyAlpha(imageData: ImageData) {
    const { LOWER, UPPER } = PERSON_PROBABILITY_THRESHOLDS;
    const pixels = imageData.height * imageData.width;
    for (let i = 0; i < pixels; i++) {
      const probability = this._tflite.HEAPF32[this._outputMemoryOffset + i];
      const probabilityClipped = probability >= UPPER ? 1 : (probability <= LOWER ? 0 : probability);
      imageData.data[i * 4 + 3] = Math.round(probabilityClipped * 255);
    }
  }

  private _createPersonMask(): ImageData {
    const { height, width } = this._inferenceDimensions;
    this._benchmark.start('inputImageResizeDelay');
    const imageDataBuffer = this._webgl2ResizePipeline?.render() as Uint8ClampedArray;
    this._benchmark.end('inputImageResizeDelay');
    const imageData = new ImageData(imageDataBuffer, width, height);
    this._benchmark.start('segmentationDelay');
    this._tflite._runInference();
    this._applyAlpha(imageData);
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
      {
        htmlElement: inputFrame,
        width: captureWidth,
        height: captureHeight,
      },
      this._backgroundImage,
      { type: this._getWebGL2PipelineType() },
      { inputResolution: `${inferenceWidth}x${inferenceHeight}` },
      this._outputCanvas!,
      this._tflite,
      this._benchmark,
      this._debounce,
    );
    this._webgl2Pipeline.updatePostProcessingConfig({
      smoothSegmentationMask: true,
      jointBilateralFilter: {
        sigmaSpace: 10,
        sigmaColor: 0.12
      },
      coverage: [
        0,
        0.99
      ],
      lightWrapping: 0,
      blendMode: 'screen'
    });
  }

  private _createWebGL2ResizePipeline(
    inputFrame: HTMLVideoElement,
    captureWidth: number,
    captureHeight: number,
    inferenceWidth: number,
    inferenceHeight: number,
  ) {
    this._webgl2ResizePipeline = buildWebGL2ResizePipeline(
      {
        htmlElement: inputFrame,
        width: captureWidth,
        height: captureHeight,
      },
      { inputResolution: `${inferenceWidth}x${inferenceHeight}` },
      this._inputCanvas,
      this._tflite,
      this._benchmark,
    );
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
}

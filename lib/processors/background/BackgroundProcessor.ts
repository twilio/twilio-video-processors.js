import { Remote, wrap } from 'comlink';
import { Processor } from '../Processor';
import { Benchmark } from '../../utils/Benchmark';
import { TwilioTFLite } from '../../utils/TwilioTFLite';
import { Dimensions, Pipeline, WebGL2PipelineType } from '../../types';
import { buildWebGL2Pipeline } from '../webgl2';

import {
  DEBOUNCE_COUNT,
  MASK_BLUR_RADIUS,
  MODEL_NAME,
  TFLITE_LOADER_NAME,
  TFLITE_SIMD_LOADER_NAME,
  TFLITE_WORKER_NAME,
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
   * @private
   */
  asyncInference?: boolean;

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
  deferWebGL2InputResize?: boolean;

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
  private static _tflite: TwilioTFLite | Remote<TwilioTFLite> | null = null;

  protected _backgroundImage: HTMLImageElement | null = null;
  protected _outputCanvas: HTMLCanvasElement | null = null;
  protected _outputContext: CanvasRenderingContext2D | WebGL2RenderingContext | null = null;
  protected _webgl2Pipeline: ReturnType<typeof buildWebGL2Pipeline> | null = null;

  private _assetsPath: string;
  private _asyncInference: boolean;
  private _benchmark: Benchmark;
  private _currentMask: Uint8ClampedArray = new Uint8ClampedArray(0);
  private _debounce: boolean = true;
  private _debounceCount: number = DEBOUNCE_COUNT;
  private _deferWebGL2InputResize: boolean;
  private _dummyImageData: ImageData = new ImageData(1, 1);
  private _inferenceDimensions: Dimensions = WASM_INFERENCE_DIMENSIONS;
  private _inputCanvas: HTMLCanvasElement;
  private _inputContext: CanvasRenderingContext2D;
  private _maskBlurRadius: number = MASK_BLUR_RADIUS;
  private _maskCanvas: OffscreenCanvas | HTMLCanvasElement;
  private _maskContext: OffscreenCanvasRenderingContext2D | CanvasRenderingContext2D;
  private _maskUsageCounter: number = 0;
  private _pipeline: Pipeline = Pipeline.WebGL2;

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
    this._asyncInference = typeof options.asyncInference === 'boolean' ? options.asyncInference : false;
    this._debounce = typeof options.debounce === 'boolean' ? options.debounce : this._debounce;
    this._debounceCount = this._debounce ? this._debounceCount : 1;
    this._deferWebGL2InputResize = typeof options.deferWebGL2InputResize === 'boolean' ? options.deferWebGL2InputResize : true;
    this._inferenceDimensions = options.inferenceDimensions! || this._inferenceDimensions;
    this._pipeline = options.pipeline! || this._pipeline;

    this._benchmark = new Benchmark();
    this._inputCanvas = document.createElement('canvas');
    this._inputContext = this._inputCanvas.getContext('2d', { willReadFrequently: true }) as CanvasRenderingContext2D;
    this._maskCanvas = typeof window.OffscreenCanvas !== 'undefined' ? new window.OffscreenCanvas(1, 1) : document.createElement('canvas');
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
    if (this._maskBlurRadius !== radius) {
      this._maskBlurRadius = radius;
      this._webgl2Pipeline?.updatePostProcessingConfig({
        jointBilateralFilter: {
          sigmaSpace: this._maskBlurRadius
        }
      });
    }
  }

  /**
   * Load the segmentation model.
   * Call this method before attaching the processor to ensure
   * video frames are processed correctly.
   */
  async loadModel() {
    if (BackgroundProcessor._tflite) {
      return;
    }
    BackgroundProcessor._tflite = this._asyncInference
      ? wrap<TwilioTFLite>(new Worker(`${this._assetsPath}${TFLITE_WORKER_NAME}`))
      : new TwilioTFLite();
    await BackgroundProcessor._tflite.initialize(
      this._assetsPath,
      MODEL_NAME,
      TFLITE_LOADER_NAME,
      TFLITE_SIMD_LOADER_NAME,
    );
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
    if (!BackgroundProcessor._tflite) {
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

  private _applyAlpha(imageData: ImageData) {
    const { height, width } = imageData;
    const pixels = width * height;
    for (let i = 0; i < pixels; i++) {
      imageData.data[i * 4 + 3] = this._currentMask[i];
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
      this._currentMask = await BackgroundProcessor
        ._tflite!
        .runInference(imageData.data);
      this._maskUsageCounter = this._debounceCount;
    }
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
      {
        htmlElement: inputFrame,
        width: captureWidth,
        height: captureHeight,
      },
      this._backgroundImage,
      {
        type: this._getWebGL2PipelineType(),
      },
      {
        deferWebGL2InputResize: this._deferWebGL2InputResize,
        inputResolution: `${inferenceWidth}x${inferenceHeight}`,
      },
      this._outputCanvas!,
      BackgroundProcessor._tflite,
      this._benchmark,
      this._debounce
    );
    this._webgl2Pipeline.updatePostProcessingConfig({
      jointBilateralFilter: {
        sigmaSpace: this._maskBlurRadius,
        sigmaColor: 0.1
      },
      coverage: [
        0,
        0.99
      ],
      lightWrapping: 0,
      blendMode: 'screen'
    });
  }

  private _getResizedInputImageData(inputFrame: OffscreenCanvas | HTMLCanvasElement | HTMLVideoElement): ImageData {
    const { width, height } = this._inputCanvas;
    this._inputContext.drawImage(inputFrame, 0, 0, width, height);
    return this._inputContext.getImageData(0, 0, width, height);
  }
}

import { DEFAULT_MODEL_TYPE, HYSTERESIS_HIGH, HYSTERESIS_LOW, MASK_BLUR_RADIUS, ModelType, SIGMA_COLOR } from '../../constants';
import { Benchmark } from '../../utils/Benchmark';
import { version } from '../../utils/version';
import { BilateralFilterType, InputFrame } from '../../types';
import { Processor } from '../Processor';
import { BackgroundProcessorPipeline, BackgroundProcessorPipelineProxy } from './pipelines/backgroundprocessorpipeline';

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
   * The type of bilateral filter to use for mask upscaling.
   * - 'separable': 2-pass filter (horizontal + vertical), faster
   * - 'joint': 2D filter (single pass), better edge quality
   * @default
   * ```html
   * 'separable'
   * ```
   */
  bilateralFilterType?: BilateralFilterType;

  /**
   * Whether the pipeline should calculate the person mask without
   * waiting for the current input frame to be downscaled. Setting
   * this to true will potentially increase the output frame rate at
   * the expense of a slight trailing effect around the person mask
   * (Chrome only).
   * @default
   * ```html
   * false
   * ```
   */
  deferInputFrameDownscale?: boolean;

  /**
   * Whether to enable hysteresis thresholding for temporal smoothing.
   * When enabled, reduces flickering at mask edges by using previous frame data.
   * @default
   * ```html
   * false
   * ```
   */
  hysteresisEnabled?: boolean;

  /**
   * The high threshold for hysteresis (0-255). Pixels above this are always foreground.
   * @default
   * ```html
   * 180
   * ```
   */
  hysteresisHigh?: number;

  /**
   * The low threshold for hysteresis (0-255). Pixels below this are always background.
   * @default
   * ```html
   * 80
   * ```
   */
  hysteresisLow?: number;

  /**
   * The blur radius to use when smoothing out the edges of the person's mask.
   * @default
   * ```html
   * 8
   * ```
   */
  maskBlurRadius?: number;

  /**
   * The segmentation model to use.
   * - 'landscape': 256x144, optimized for landscape video (default)
   * - 'square': 256x256, better for square or portrait video
   * @default
   * ```html
   * 'landscape'
   * ```
   */
  modelType?: ModelType;

  /**
   * The sigma color parameter for the bilateral filter (0.01-1.0).
   * Lower values preserve edges better.
   * @default
   * ```html
   * 0.1
   * ```
   */
  sigmaColor?: number;

  /**
   * Whether to skip post-processing and output the raw segmentation mask.
   * Useful for debugging.
   * @default
   * ```html
   * false
   * ```
   */
  skipPostProcessing?: boolean;

  /**
   * Whether to use a web worker (Chrome only).
   * @default
   * ```html
   * true
   * ```
   */
  useWebWorker?: boolean;
}

/**
 * @private
 */
export class BackgroundProcessor<T extends BackgroundProcessorPipeline | BackgroundProcessorPipelineProxy = BackgroundProcessorPipeline | BackgroundProcessorPipelineProxy> extends Processor {
  protected readonly _assetsPath: string;
  protected readonly _backgroundProcessorPipeline: T;

  private readonly _benchmark: Benchmark;
  private _bilateralFilterType: BilateralFilterType = 'separable';
  private _deferInputFrameDownscale: boolean = false;
  private _hysteresisEnabled: boolean = false;
  private _hysteresisHigh: number = HYSTERESIS_HIGH;
  private _hysteresisLow: number = HYSTERESIS_LOW;
  private readonly _inputFrameCanvas: OffscreenCanvas = new OffscreenCanvas(1, 1);
  private readonly _inputFrameContext: OffscreenCanvasRenderingContext2D = this._inputFrameCanvas.getContext('2d', { willReadFrequently: true })!;
  private _isSimdEnabled: boolean | null = null;
  private _maskBlurRadius: number = MASK_BLUR_RADIUS;
  private _modelType: ModelType = DEFAULT_MODEL_TYPE;
  private _outputFrameBuffer: HTMLCanvasElement | null = null;
  private _outputFrameBufferContext: CanvasRenderingContext2D | ImageBitmapRenderingContext | null = null;
  private _sigmaColor: number = SIGMA_COLOR;
  private _skipPostProcessing: boolean = false;

  // This version is read by the Video SDK
  // tslint:disable-next-line no-unused-variable
  private readonly _version: string = version;

  protected constructor(
    backgroundProcessorPipeline: T,
    options: BackgroundProcessorOptions
  ) {
    super();

    const {
      assetsPath,
      bilateralFilterType = this._bilateralFilterType,
      deferInputFrameDownscale = this._deferInputFrameDownscale,
      hysteresisEnabled = this._hysteresisEnabled,
      hysteresisHigh = this._hysteresisHigh,
      hysteresisLow = this._hysteresisLow,
      maskBlurRadius = this._maskBlurRadius,
      modelType = this._modelType,
      sigmaColor = this._sigmaColor,
      skipPostProcessing = this._skipPostProcessing
    } = options;

    if (typeof assetsPath !== 'string') {
      throw new Error('assetsPath parameter must be a string');
    }

    // Ensures assetsPath ends with a trailing slash ('/').
    this._assetsPath = assetsPath.replace(/([^/])$/, '$1/');
    this._backgroundProcessorPipeline = backgroundProcessorPipeline;
    // @ts-expect-error - _benchmark is a private property in the pipeline classes definition
    this._benchmark = this._backgroundProcessorPipeline._benchmark;
    this._bilateralFilterType = bilateralFilterType;
    this.deferInputFrameDownscale = deferInputFrameDownscale;
    this.hysteresisEnabled = hysteresisEnabled;
    this.hysteresisHigh = hysteresisHigh;
    this.hysteresisLow = hysteresisLow;
    this.maskBlurRadius = maskBlurRadius;
    this._modelType = modelType;
    this.sigmaColor = sigmaColor;
    this.skipPostProcessing = skipPostProcessing;
  }

  /**
   * The current bilateral filter type.
   */
  get bilateralFilterType(): BilateralFilterType {
    return this._bilateralFilterType;
  }

  /**
   * Set the bilateral filter type ('separable' or 'joint').
   */
  set bilateralFilterType(type: BilateralFilterType) {
    if (type !== 'separable' && type !== 'joint') {
      console.warn(`Valid bilateral filter type not found. Using 'separable' as default.`);
      type = 'separable';
    }
    if (this._bilateralFilterType !== type) {
      this._bilateralFilterType = type;
      this._backgroundProcessorPipeline
        .setBilateralFilterType(this._bilateralFilterType)
        .catch(() => {
          /* noop */
        });
    }
  }

  /**
   * Whether the pipeline is calculating the person mask without
   * waiting for the current input frame to be downscaled (Chrome only).
   */
  get deferInputFrameDownscale(): boolean {
    return this._deferInputFrameDownscale;
  }

  /**
   * Toggle whether the pipeline should calculate the person mask
   * without waiting for the current input frame to be downscaled
   * (Chrome only).
   */
  set deferInputFrameDownscale(defer: boolean) {
    if (typeof defer !== 'boolean') {
      console.warn('Provided deferInputFrameDownscale is not a boolean.');
      defer = this._deferInputFrameDownscale;
    }
    if (this._deferInputFrameDownscale !== defer) {
      this._deferInputFrameDownscale = defer;
      this._backgroundProcessorPipeline.setDeferInputFrameDownscale(
        this._deferInputFrameDownscale
      ).catch(() => {
        /* noop */
      });
    }
  }

  /**
   * Whether hysteresis thresholding is enabled.
   */
  get hysteresisEnabled(): boolean {
    return this._hysteresisEnabled;
  }

  /**
   * Enable or disable hysteresis thresholding for temporal smoothing.
   */
  set hysteresisEnabled(enabled: boolean) {
    if (typeof enabled !== 'boolean') {
      console.warn('Provided hysteresisEnabled is not a boolean.');
      enabled = false;
    }
    if (this._hysteresisEnabled !== enabled) {
      this._hysteresisEnabled = enabled;
      this._backgroundProcessorPipeline
        .setHysteresisEnabled(this._hysteresisEnabled)
        .catch(() => {
          /* noop */
        });
    }
  }

  /**
   * The current high threshold for hysteresis (0-255).
   */
  get hysteresisHigh(): number {
    return this._hysteresisHigh;
  }

  /**
   * Set the high threshold for hysteresis (0-255).
   */
  set hysteresisHigh(high: number) {
    if (typeof high !== 'number' || high < 0 || high > 255) {
      console.warn(`Valid hysteresis high threshold not found. Using ${HYSTERESIS_HIGH} as default.`);
      high = HYSTERESIS_HIGH;
    }
    if (this._hysteresisHigh !== high) {
      this._hysteresisHigh = high;
      this._backgroundProcessorPipeline
        .setHysteresisHigh(this._hysteresisHigh)
        .catch(() => {
          /* noop */
        });
    }
  }

  /**
   * The current low threshold for hysteresis (0-255).
   */
  get hysteresisLow(): number {
    return this._hysteresisLow;
  }

  /**
   * Set the low threshold for hysteresis (0-255).
   */
  set hysteresisLow(low: number) {
    if (typeof low !== 'number' || low < 0 || low > 255) {
      console.warn(`Valid hysteresis low threshold not found. Using ${HYSTERESIS_LOW} as default.`);
      low = HYSTERESIS_LOW;
    }
    if (this._hysteresisLow !== low) {
      this._hysteresisLow = low;
      this._backgroundProcessorPipeline
        .setHysteresisLow(this._hysteresisLow)
        .catch(() => {
          /* noop */
        });
    }
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
      this._backgroundProcessorPipeline
        .setMaskBlurRadius(this._maskBlurRadius)
        .catch(() => {
          /* noop */
        });
    }
  }

  /**
   * The current segmentation model type.
   */
  get modelType(): ModelType {
    return this._modelType;
  }

  /**
   * Set the segmentation model type ('landscape' or 'square').
   */
  set modelType(modelType: ModelType) {
    if (modelType !== 'landscape' && modelType !== 'square') {
      console.warn(`Valid model type not found. Using '${DEFAULT_MODEL_TYPE}' as default.`);
      modelType = DEFAULT_MODEL_TYPE;
    }
    if (this._modelType !== modelType) {
      this._modelType = modelType;
      this._backgroundProcessorPipeline
        .setModelType(this._modelType)
        .catch(() => {
          /* noop */
        });
    }
  }

  /**
   * The current sigma color parameter for the bilateral filter.
   */
  get sigmaColor(): number {
    return this._sigmaColor;
  }

  /**
   * Set the sigma color parameter for the bilateral filter (0.01-1.0).
   */
  set sigmaColor(sigmaColor: number) {
    if (typeof sigmaColor !== 'number' || sigmaColor < 0.01 || sigmaColor > 1.0) {
      console.warn(`Valid sigma color not found. Using ${SIGMA_COLOR} as default.`);
      sigmaColor = SIGMA_COLOR;
    }
    if (this._sigmaColor !== sigmaColor) {
      this._sigmaColor = sigmaColor;
      this._backgroundProcessorPipeline
        .setSigmaColor(this._sigmaColor)
        .catch(() => {
          /* noop */
        });
    }
  }

  /**
   * Whether post-processing is skipped (raw mask output).
   */
  get skipPostProcessing(): boolean {
    return this._skipPostProcessing;
  }

  /**
   * Enable or disable skipping post-processing to show raw mask.
   */
  set skipPostProcessing(skip: boolean) {
    if (typeof skip !== 'boolean') {
      console.warn('Provided skipPostProcessing is not a boolean.');
      skip = false;
    }
    if (this._skipPostProcessing !== skip) {
      this._skipPostProcessing = skip;
      this._backgroundProcessorPipeline
        .setSkipPostProcessing(this._skipPostProcessing)
        .catch(() => {
          /* noop */
        });
    }
  }

  /**
   * Load the segmentation model.
   * Call this method before attaching the processor to ensure
   * video frames are processed correctly.
   */
  async loadModel(): Promise<void> {
    this._isSimdEnabled = await this
      ._backgroundProcessorPipeline
      .loadTwilioTFLite();
  }

  /**
   * Apply a transform to the background of an input video frame and leaving
   * the foreground (person(s)) untouched. Any exception detected will
   * result in the frame being dropped.
   * @param inputFrameBuffer - The source of the input frame to process.
   * <br/>
   * <br/>
   * [OffscreenCanvas](https://developer.mozilla.org/en-US/docs/Web/API/OffscreenCanvas) - Good for canvas-related processing
   * that can be rendered off screen.
   * <br/>
   * <br/>
   * [HTMLCanvasElement](https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement) - This is recommended on browsers
   * that doesn't support `OffscreenCanvas`, or if you need to render the frame on the screen.
   * <br/>
   * <br/>
   * [HTMLVideoElement](https://developer.mozilla.org/en-US/docs/Web/API/HTMLVideoElement)
   * <br/>
   * <br/>
   * [VideoFrame](https://developer.mozilla.org/en-US/docs/Web/API/VideoFrame) - Recommended on browsers that support the
   * [Insertable Streams API](https://developer.mozilla.org/en-US/docs/Web/API/Insertable_Streams_for_MediaStreamTrack_API).
   * <br/>
   * @param outputFrameBuffer - The output frame buffer to use to draw the processed frame.
   */
  async processFrame(
    inputFrameBuffer: OffscreenCanvas | HTMLCanvasElement | HTMLVideoElement | VideoFrame,
    outputFrameBuffer: HTMLCanvasElement
  ): Promise<void> {
    if (!inputFrameBuffer || !outputFrameBuffer) {
      throw new Error('Missing input or output frame buffer');
    }

    const {
      _backgroundProcessorPipeline,
      _benchmark,
      _outputFrameBufferContext
    } = this;

    _benchmark.end('captureFrameDelay');
    _benchmark.end('totalProcessingDelay');
    _benchmark.start('totalProcessingDelay');
    _benchmark.start('processFrameDelay');

    // Extract dimensions based on input frame buffer type
    const {
      width: captureWidth,
      height: captureHeight
    } = this._getFrameDimensions(inputFrameBuffer);

    if (this._outputFrameBuffer !== outputFrameBuffer) {
      this._outputFrameBuffer = outputFrameBuffer;
      this._outputFrameBufferContext = outputFrameBuffer.getContext('2d')
        || outputFrameBuffer.getContext('bitmaprenderer');
    }
    if (this._inputFrameCanvas.width !== captureWidth) {
      this._inputFrameCanvas.width = captureWidth;
    }
    if (this._inputFrameCanvas.height !== captureHeight) {
      this._inputFrameCanvas.height = captureHeight;
    }

    // For HTMLVideoElement, we need to draw it to a canvas first
    // For other input types (OffscreenCanvas, HTMLCanvasElement, VideoFrame), we can use them directly
    let inputFrame: InputFrame;
    if (inputFrameBuffer instanceof HTMLVideoElement) {
      this._inputFrameContext.drawImage(inputFrameBuffer, 0, 0);
      inputFrame = this._inputFrameCanvas;
    } else {
      inputFrame = inputFrameBuffer;
    }

    // Process the input frame through the appropriate pipeline and return the processed frame
    const outputFrame = _backgroundProcessorPipeline instanceof BackgroundProcessorPipeline
      ? await _backgroundProcessorPipeline.render(inputFrame)
      : await _backgroundProcessorPipeline.render(
          inputFrame instanceof OffscreenCanvas
            ? inputFrame.transferToImageBitmap()
            : inputFrame as VideoFrame // TODO(lrivas): Review why we need to cast to VideoFrame, this breaks when using 'canvas' as inputFrameBufferType
          );

    // Render the processed frame through the output frame buffer context
    if (_outputFrameBufferContext instanceof ImageBitmapRenderingContext) {
      const outputBitmap = outputFrame instanceof OffscreenCanvas
        ? outputFrame.transferToImageBitmap()
        : outputFrame;
      _outputFrameBufferContext.transferFromImageBitmap(outputBitmap);
    } else if (_outputFrameBufferContext instanceof CanvasRenderingContext2D && outputFrame) {
      _outputFrameBufferContext.drawImage(
        outputFrame,
        0,
        0
      );
    }

    _benchmark.end('processFrameDelay');
    _benchmark.start('captureFrameDelay');
  }

  /**
   * Gets the dimensions of a frame buffer based on its type
  */
  private _getFrameDimensions(buffer: OffscreenCanvas | HTMLCanvasElement | HTMLVideoElement | VideoFrame): { width: number, height: number } {
    if (buffer instanceof HTMLVideoElement) {
      return { width: buffer.videoWidth, height: buffer.videoHeight };
    }
    
    if (buffer instanceof VideoFrame) {
      return { width: buffer.displayWidth, height: buffer.displayHeight };
    }
    
    return { width: buffer.width, height: buffer.height };
  }
}

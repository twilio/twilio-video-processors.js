import { HYSTERESIS_ENABLED, HYSTERESIS_HIGH, HYSTERESIS_LOW, MASK_BLUR_RADIUS } from '../../constants';
import { Benchmark } from '../../utils/Benchmark';
import { version } from '../../utils/version';
import { InputFrame } from '../../types';
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
   * Whether to apply hysteresis thresholding to reduce mask flickering
   * between frames. When enabled, ambiguous pixels use the previous
   * frame's mask values for temporal smoothing.
   * @default
   * ```html
   * true
   * ```
   */
  hysteresisEnabled?: boolean;

  /**
   * The upper alpha threshold for hysteresis. Pixels with alpha at or
   * above this value are snapped to 255 (fully foreground).
   * @default
   * ```html
   * 180
   * ```
   */
  hysteresisHighThreshold?: number;

  /**
   * The lower alpha threshold for hysteresis. Pixels with alpha at or
   * below this value are snapped to 0 (fully background).
   * @default
   * ```html
   * 80
   * ```
   */
  hysteresisLowThreshold?: number;

  /**
   * The blur radius to use when smoothing out the edges of the person's mask.
   * @default
   * ```html
   * 8
   * ```
   */
  maskBlurRadius?: number;

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
  private _deferInputFrameDownscale: boolean = false;
  private _hysteresisEnabled: boolean = HYSTERESIS_ENABLED;
  private _hysteresisHighThreshold: number = HYSTERESIS_HIGH;
  private _hysteresisLowThreshold: number = HYSTERESIS_LOW;
  private readonly _inputFrameCanvas: OffscreenCanvas = new OffscreenCanvas(1, 1);
  private readonly _inputFrameContext: OffscreenCanvasRenderingContext2D = this._inputFrameCanvas.getContext('2d', { willReadFrequently: true })!;
  private _isSimdEnabled: boolean | null = null;
  private _maskBlurRadius: number = MASK_BLUR_RADIUS;
  private _outputFrameBuffer: HTMLCanvasElement | null = null;
  private _outputFrameBufferContext: CanvasRenderingContext2D | ImageBitmapRenderingContext | null = null;

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
      deferInputFrameDownscale = this._deferInputFrameDownscale,
      hysteresisEnabled = this._hysteresisEnabled,
      hysteresisHighThreshold = this._hysteresisHighThreshold,
      hysteresisLowThreshold = this._hysteresisLowThreshold,
      maskBlurRadius = this._maskBlurRadius
    } = options;

    if (typeof assetsPath !== 'string') {
      throw new Error('assetsPath parameter must be a string');
    }

    // Ensures assetsPath ends with a trailing slash ('/').
    this._assetsPath = assetsPath.replace(/([^/])$/, '$1/');
    this._backgroundProcessorPipeline = backgroundProcessorPipeline;
    // @ts-expect-error - _benchmark is a private property in the pipeline classes definition
    this._benchmark = this._backgroundProcessorPipeline._benchmark;
    this.deferInputFrameDownscale = deferInputFrameDownscale;
    this.hysteresisEnabled = hysteresisEnabled;
    this.hysteresisHighThreshold = hysteresisHighThreshold;
    this.hysteresisLowThreshold = hysteresisLowThreshold;
    this.maskBlurRadius = maskBlurRadius;
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
   * Whether hysteresis thresholding is enabled to reduce mask flickering.
   */
  get hysteresisEnabled(): boolean {
    return this._hysteresisEnabled;
  }

  /**
   * Toggle hysteresis thresholding for temporal mask smoothing.
   */
  set hysteresisEnabled(enabled: boolean) {
    if (typeof enabled !== 'boolean') {
      console.warn('Provided hysteresisEnabled is not a boolean.');
      enabled = this._hysteresisEnabled;
    }
    if (this._hysteresisEnabled !== enabled) {
      this._hysteresisEnabled = enabled;
      this._backgroundProcessorPipeline.setHysteresisEnabled(
        this._hysteresisEnabled
      ).catch(() => {
        /* noop */
      });
    }
  }

  /**
   * The upper alpha threshold for hysteresis.
   */
  get hysteresisHighThreshold(): number {
    return this._hysteresisHighThreshold;
  }

  /**
   * Set the upper alpha threshold for hysteresis. Pixels at or above
   * this value are snapped to 255 (fully foreground).
   */
  set hysteresisHighThreshold(threshold: number) {
    if (!Number.isFinite(threshold) || threshold < 0 || threshold > 255) {
      console.warn(`Valid hysteresisHighThreshold not found. Using ${HYSTERESIS_HIGH} as default.`);
      threshold = HYSTERESIS_HIGH;
    }
    if (this._hysteresisHighThreshold !== threshold) {
      this._hysteresisHighThreshold = threshold;
      this._backgroundProcessorPipeline.setHysteresisHighThreshold(
        this._hysteresisHighThreshold
      ).catch(() => {
        /* noop */
      });
    }
  }

  /**
   * The lower alpha threshold for hysteresis.
   */
  get hysteresisLowThreshold(): number {
    return this._hysteresisLowThreshold;
  }

  /**
   * Set the lower alpha threshold for hysteresis. Pixels at or below
   * this value are snapped to 0 (fully background).
   */
  set hysteresisLowThreshold(threshold: number) {
    if (!Number.isFinite(threshold) || threshold < 0 || threshold > 255) {
      console.warn(`Valid hysteresisLowThreshold not found. Using ${HYSTERESIS_LOW} as default.`);
      threshold = HYSTERESIS_LOW;
    }
    if (this._hysteresisLowThreshold !== threshold) {
      this._hysteresisLowThreshold = threshold;
      this._backgroundProcessorPipeline.setHysteresisLowThreshold(
        this._hysteresisLowThreshold
      ).catch(() => {
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

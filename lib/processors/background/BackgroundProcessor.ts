import { MASK_BLUR_RADIUS } from '../../constants';
import { Benchmark } from '../../utils/Benchmark';
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
export class BackgroundProcessor extends Processor {
  protected readonly _assetsPath: string;
  protected readonly _backgroundProcessorPipeline: BackgroundProcessorPipeline | BackgroundProcessorPipelineProxy;

  private readonly _benchmark: Benchmark;
  private _deferInputFrameDownscale: boolean = false;
  private readonly _inputFrameCanvas: OffscreenCanvas = new OffscreenCanvas(1, 1);
  private readonly _inputFrameContext: OffscreenCanvasRenderingContext2D = this._inputFrameCanvas.getContext('2d', { willReadFrequently: true })!;
  private _isSimdEnabled: boolean | null = null;
  private _maskBlurRadius: number = MASK_BLUR_RADIUS;
  private _outputFrameBuffer: HTMLCanvasElement | null = null;
  private _outputFrameBufferContext: CanvasRenderingContext2D | ImageBitmapRenderingContext | null = null;

  protected constructor(
    backgroundProcessorPipeline: BackgroundProcessorPipeline | BackgroundProcessorPipelineProxy,
    options: BackgroundProcessorOptions
  ) {
    super();

    const {
      assetsPath,
      deferInputFrameDownscale = this._deferInputFrameDownscale,
      maskBlurRadius = this._maskBlurRadius
    } = options;

    if (typeof assetsPath !== 'string') {
      throw new Error('assetsPath parameter must be a string');
    }

    this._assetsPath = assetsPath.replace(/([^/])$/, '$1/');
    this._backgroundProcessorPipeline = backgroundProcessorPipeline;
    // @ts-ignore
    this._benchmark = this._backgroundProcessorPipeline._benchmark;
    this.deferInputFrameDownscale = deferInputFrameDownscale;
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

    const {
      width: captureWidth,
      height: captureHeight
    } = inputFrameBuffer instanceof HTMLVideoElement
      ? { width: inputFrameBuffer.videoWidth, height: inputFrameBuffer.videoHeight }
      : typeof VideoFrame === 'function' && inputFrameBuffer instanceof VideoFrame
        ? { width: inputFrameBuffer.displayWidth, height: inputFrameBuffer.displayHeight }
        : inputFrameBuffer as (OffscreenCanvas | HTMLCanvasElement);

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

    let inputFrame: InputFrame;
    if (inputFrameBuffer instanceof HTMLVideoElement) {
      this._inputFrameContext.drawImage(
        inputFrameBuffer,
        0,
        0
      );
      inputFrame = this._inputFrameCanvas;
    } else {
      inputFrame = inputFrameBuffer;
    }

    const outputFrame = _backgroundProcessorPipeline instanceof BackgroundProcessorPipeline
      ? await (_backgroundProcessorPipeline as BackgroundProcessorPipeline)
          .render(
            inputFrame
          )
      : await (_backgroundProcessorPipeline as BackgroundProcessorPipelineProxy)
          .render(
            inputFrame instanceof OffscreenCanvas
              ? inputFrame.transferToImageBitmap()
              : (inputFrame as VideoFrame)
          );

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
}

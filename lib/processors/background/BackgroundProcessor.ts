import { Processor } from '../Processor';
import { Benchmark } from '../../utils/Benchmark';
import { TwilioTFLite } from '../../utils/TwilioTFLite';
import { isChromiumImageBitmap } from '../../utils/support';
import { Dimensions, Pipeline, WebGL2PipelineType } from '../../types';
import { buildWebGL2Pipeline } from '../webgl2';

import {
  MASK_BLUR_RADIUS,
  MODEL_NAME,
  TFLITE_LOADER_NAME,
  TFLITE_SIMD_LOADER_NAME,
  WASM_INFERENCE_DIMENSIONS,
} from '../../constants';

type InputResizeMode = 'canvas' | 'image-bitmap';

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
  deferInputResize?: boolean;

  /**
   * @private
   */
  inferenceDimensions?: Dimensions;

  /**
   * @private
   */
  inputResizeMode?: InputResizeMode;

  /**
   * The blur radius to use when smoothing out the edges of the person's mask.
   * @default
   * ```html
   * 8 for WebGL2 pipeline, 4 for Canvas2D pipeline
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
  private static _tflite: TwilioTFLite | null = null;

  protected _backgroundImage: HTMLImageElement | null = null;
  protected _outputCanvas: HTMLCanvasElement | null = null;
  protected _outputContext: CanvasRenderingContext2D | WebGL2RenderingContext | null = null;
  protected _webgl2Pipeline: ReturnType<typeof buildWebGL2Pipeline> | null = null;

  private _assetsPath: string;
  private _benchmark: Benchmark;
  private _currentMask: ImageData | null;
  private _debounce: boolean;
  private _deferInputResize: boolean;
  private _inferenceDimensions: Dimensions = WASM_INFERENCE_DIMENSIONS;
  private _inferenceInputCanvas: OffscreenCanvas | HTMLCanvasElement;
  private _inferenceInputContext: OffscreenCanvasRenderingContext2D | CanvasRenderingContext2D;
  private _inputFrameCanvas: OffscreenCanvas | HTMLCanvasElement;
  private _inputFrameContext: OffscreenCanvasRenderingContext2D | CanvasRenderingContext2D;
  private _inputResizeMode: InputResizeMode;
  // tslint:disable-next-line no-unused-variable
  private _isSimdEnabled: boolean | null;
  private _maskBlurRadius: number;
  private _maskCanvas: OffscreenCanvas | HTMLCanvasElement;
  private _maskContext: OffscreenCanvasRenderingContext2D | CanvasRenderingContext2D;
  private _pipeline: Pipeline;

  constructor(options: BackgroundProcessorOptions) {
    super();

    if (typeof options.assetsPath !== 'string') {
      throw new Error('assetsPath parameter is missing');
    }
    let assetsPath = options.assetsPath;
    if (assetsPath && assetsPath[assetsPath.length - 1] !== '/') {
      assetsPath += '/';
    }

    this._assetsPath = assetsPath;
    this._debounce = typeof options.debounce === 'boolean' ? options.debounce : true;
    this._inferenceDimensions = options.inferenceDimensions! || this._inferenceDimensions;

    this._inputResizeMode = typeof options.inputResizeMode === 'string'
      ? options.inputResizeMode
      : (isChromiumImageBitmap() ? 'image-bitmap' : 'canvas');

    this._pipeline = options.pipeline!
      || Pipeline.WebGL2;

    this._deferInputResize = typeof options.deferInputResize === 'boolean'
      ? options.deferInputResize
      : (this._pipeline === Pipeline.WebGL2 && this._getWebGL2PipelineType() === WebGL2PipelineType.Blur);

    this._benchmark = new Benchmark();
    this._currentMask = null;
    this._isSimdEnabled = null;
    this._inferenceInputCanvas = typeof OffscreenCanvas !== 'undefined' ? new OffscreenCanvas(1, 1) : document.createElement('canvas');
    this._inferenceInputContext = this._inferenceInputCanvas.getContext('2d', { willReadFrequently: true }) as OffscreenCanvasRenderingContext2D;
    this._inputFrameCanvas = typeof OffscreenCanvas !== 'undefined' ? new OffscreenCanvas(1, 1) : document.createElement('canvas');
    this._inputFrameContext = this._inputFrameCanvas.getContext('2d') as OffscreenCanvasRenderingContext2D;
    this._maskBlurRadius = typeof options.maskBlurRadius === 'number' ? options.maskBlurRadius : (
      this._pipeline === Pipeline.WebGL2 ? MASK_BLUR_RADIUS : (MASK_BLUR_RADIUS / 2)
    );
    this._maskCanvas = typeof OffscreenCanvas !== 'undefined' ? new OffscreenCanvas(1, 1) : document.createElement('canvas');
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
  async loadModel(): Promise<void> {
    let { _tflite: tflite } = BackgroundProcessor;
    if (!tflite) {
      tflite = new TwilioTFLite();
      await tflite.initialize(
        this._assetsPath,
        MODEL_NAME,
        TFLITE_LOADER_NAME,
        TFLITE_SIMD_LOADER_NAME,
      );
      BackgroundProcessor._tflite = tflite;
    }
    this._isSimdEnabled = tflite.isSimdEnabled;
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

    const {
      width: inferenceWidth,
      height: inferenceHeight
    } = this._inferenceDimensions;

    const {
      width: captureWidth,
      height: captureHeight
    } = inputFrameBuffer instanceof HTMLVideoElement
      ? { width: inputFrameBuffer.videoWidth, height: inputFrameBuffer.videoHeight }
      : inputFrameBuffer;

    if (this._outputCanvas !== outputFrameBuffer) {
      this._outputCanvas = outputFrameBuffer;
      this._outputContext = this._outputCanvas
        .getContext(this._pipeline === Pipeline.Canvas2D ? '2d' : 'webgl2') as
        CanvasRenderingContext2D | WebGL2RenderingContext;
      this._webgl2Pipeline?.cleanUp();
      this._webgl2Pipeline = null;
    }

    if (this._pipeline === Pipeline.WebGL2) {
      if (!this._webgl2Pipeline) {
        this._createWebGL2Pipeline(
          inputFrameBuffer as HTMLVideoElement,
          captureWidth,
          captureHeight,
          inferenceWidth,
          inferenceHeight
        );
      }
      this._webgl2Pipeline?.sampleInputFrame();
    }

    // Only set the canvas' dimensions if they have changed to prevent unnecessary redraw
    if (this._inputFrameCanvas.width !== captureWidth) {
      this._inputFrameCanvas.width = captureWidth;
    }
    if (this._inputFrameCanvas.height !== captureHeight) {
      this._inputFrameCanvas.height = captureHeight;
    }
    if (this._inferenceInputCanvas.width !== inferenceWidth) {
      this._inferenceInputCanvas.width = inferenceWidth;
      this._maskCanvas.width = inferenceWidth;
    }
    if (this._inferenceInputCanvas.height !== inferenceHeight) {
      this._inferenceInputCanvas.height = inferenceHeight;
      this._maskCanvas.height = inferenceHeight;
    }

    let inputFrame: OffscreenCanvas | HTMLCanvasElement | HTMLVideoElement;
    if (inputFrameBuffer instanceof HTMLVideoElement) {
      this._inputFrameContext.drawImage(inputFrameBuffer, 0, 0);
      inputFrame = this._inputFrameCanvas;
    } else {
      inputFrame = inputFrameBuffer;
    }

    const personMask = await this._createPersonMask(inputFrame);
    if (this._debounce) {
      this._currentMask = this._currentMask === personMask
        ? null
        : personMask;
    }

    if (this._pipeline === Pipeline.WebGL2) {
      this._webgl2Pipeline?.render(personMask.data);
    }
    else {
      this._benchmark.start('imageCompositionDelay');
      if (!this._debounce || this._currentMask) {
        this._maskContext.putImageData(personMask, 0, 0);
      }
      const ctx = this._outputContext as CanvasRenderingContext2D;
      const {
        height: outputHeight,
        width: outputWidth
      } = this._outputCanvas;
      ctx.save();
      ctx.filter = `blur(${this._maskBlurRadius}px)`;
      ctx.globalCompositeOperation = 'copy';
      ctx.drawImage(this._maskCanvas, 0, 0, outputWidth, outputHeight);
      ctx.filter = 'none';
      ctx.globalCompositeOperation = 'source-in';
      ctx.drawImage(inputFrame, 0, 0, outputWidth, outputHeight);
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

  protected abstract _setBackground(inputFrame?: OffscreenCanvas | HTMLCanvasElement): void;

  private async _createPersonMask(inputFrame: OffscreenCanvas | HTMLCanvasElement): Promise<ImageData> {
    const { height, width } = this._inferenceDimensions;
    const stages = {
      inference: {
        false: () => BackgroundProcessor._tflite!.runInference(),
        true: () => this._currentMask!.data
      },
      resize: {
        false: async () => this._resizeInputFrame(inputFrame),
        true: async () => { /* noop */ }
      }
    };
    const shouldDebounce = !!this._currentMask;
    const inferenceStage = stages.inference[`${shouldDebounce}`];
    const resizeStage = stages.resize[`${shouldDebounce}`];

    this._benchmark.start('inputImageResizeDelay');
    const resizePromise = resizeStage();
    if (!this._deferInputResize) {
      await resizePromise;
    }
    this._benchmark.end('inputImageResizeDelay');
    this._benchmark.start('segmentationDelay');
    const personMaskBuffer = inferenceStage();
    this._benchmark.end('segmentationDelay');
    return this._currentMask || new ImageData(personMaskBuffer, width, height);
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
        inputResolution: `${inferenceWidth}x${inferenceHeight}`,
      },
      this._outputCanvas!,
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

  private async _resizeInputFrame(inputFrame: OffscreenCanvas | HTMLCanvasElement): Promise<void> {
    const {
      _inferenceInputCanvas: {
        width: resizeWidth,
        height: resizeHeight
      },
      _inferenceInputContext: ctx,
      _inputResizeMode: resizeMode
    } = this;
    if (resizeMode === 'image-bitmap') {
      const resizedInputFrameBitmap = await createImageBitmap(inputFrame, {
        resizeWidth,
        resizeHeight,
        resizeQuality: 'pixelated'
      });
      ctx.drawImage(resizedInputFrameBitmap, 0, 0, resizeWidth, resizeHeight);
      resizedInputFrameBitmap.close();
    } else {
      ctx.drawImage(inputFrame, 0, 0, resizeWidth, resizeHeight);
    }
    const imageData = ctx.getImageData(0, 0, resizeWidth, resizeHeight);
    BackgroundProcessor._tflite!.loadInputBuffer(imageData.data);
  }
}

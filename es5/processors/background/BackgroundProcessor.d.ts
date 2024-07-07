import { Processor } from '../Processor';
import { Dimensions, Pipeline, WebGL2PipelineType } from '../../types';
import { buildWebGL2Pipeline } from '../webgl2';
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
export declare abstract class BackgroundProcessor extends Processor {
    private static _tflite;
    protected _backgroundImage: HTMLImageElement | null;
    protected _outputCanvas: HTMLCanvasElement | null;
    protected _outputContext: CanvasRenderingContext2D | WebGL2RenderingContext | null;
    protected _webgl2Pipeline: ReturnType<typeof buildWebGL2Pipeline> | null;
    private _assetsPath;
    private _benchmark;
    private _currentMask;
    private _debounce;
    private _deferInputResize;
    private _inferenceDimensions;
    private _inferenceInputCanvas;
    private _inferenceInputContext;
    private _inputFrameCanvas;
    private _inputFrameContext;
    private _inputResizeMode;
    private _isSimdEnabled;
    private _maskBlurRadius;
    private _maskCanvas;
    private _maskContext;
    private _pipeline;
    constructor(options: BackgroundProcessorOptions);
    /**
     * The current blur radius when smoothing out the edges of the person's mask.
     */
    get maskBlurRadius(): number;
    /**
     * Set a new blur radius to be used when smoothing out the edges of the person's mask.
     */
    set maskBlurRadius(radius: number);
    /**
     * Load the segmentation model.
     * Call this method before attaching the processor to ensure
     * video frames are processed correctly.
     */
    loadModel(): Promise<void>;
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
    processFrame(inputFrameBuffer: OffscreenCanvas | HTMLCanvasElement | HTMLVideoElement, outputFrameBuffer: HTMLCanvasElement): Promise<void>;
    protected abstract _getWebGL2PipelineType(): WebGL2PipelineType;
    protected abstract _setBackground(inputFrame?: OffscreenCanvas | HTMLCanvasElement): void;
    private _createPersonMask;
    private _createWebGL2Pipeline;
    private _resizeInputFrame;
}
export {};

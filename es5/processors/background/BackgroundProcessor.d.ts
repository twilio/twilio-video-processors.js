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
export declare class BackgroundProcessor<T extends BackgroundProcessorPipeline | BackgroundProcessorPipelineProxy = BackgroundProcessorPipeline | BackgroundProcessorPipelineProxy> extends Processor {
    protected readonly _assetsPath: string;
    protected readonly _backgroundProcessorPipeline: T;
    private readonly _benchmark;
    private _deferInputFrameDownscale;
    private readonly _inputFrameCanvas;
    private readonly _inputFrameContext;
    private _isSimdEnabled;
    private _maskBlurRadius;
    private _outputFrameBuffer;
    private _outputFrameBufferContext;
    private readonly _version;
    protected constructor(backgroundProcessorPipeline: T, options: BackgroundProcessorOptions);
    /**
     * Whether the pipeline is calculating the person mask without
     * waiting for the current input frame to be downscaled (Chrome only).
     */
    get deferInputFrameDownscale(): boolean;
    /**
     * Toggle whether the pipeline should calculate the person mask
     * without waiting for the current input frame to be downscaled
     * (Chrome only).
     */
    set deferInputFrameDownscale(defer: boolean);
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
    processFrame(inputFrameBuffer: OffscreenCanvas | HTMLCanvasElement | HTMLVideoElement | VideoFrame, outputFrameBuffer: HTMLCanvasElement): Promise<void>;
    /**
     * Gets the dimensions of a frame buffer based on its type
    */
    private _getFrameDimensions;
}

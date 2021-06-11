import '@tensorflow/tfjs-backend-webgl';
import '@tensorflow/tfjs-backend-cpu';
import { PersonInferenceConfig } from '@tensorflow-models/body-pix/dist/body_pix_model';
import { Processor } from '../Processor';
import { Dimensions } from '../../types';
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
export declare abstract class BackgroundProcessor extends Processor {
    private static _model;
    private static _loadModel;
    protected _outputCanvas: HTMLCanvasElement;
    protected _outputContext: CanvasRenderingContext2D;
    private _assetsPath;
    private _benchmark;
    private _currentMask;
    private _debounce;
    private _dummyImageData;
    private _historyCount;
    private _inferenceConfig;
    private _inferenceDimensions;
    private _inputCanvas;
    private _inputContext;
    private _inputMemoryOffset;
    private _isSimdEnabled;
    private _maskBlurRadius;
    private _maskCanvas;
    private _maskContext;
    private _masks;
    private _maskUsageCounter;
    private _outputMemoryOffset;
    private _personProbabilityThreshold;
    private _tflite;
    private _useWasm;
    private readonly _version;
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
     * @param outputFrameBuffer - The output frame buffer to use to draw the processed frame.
     */
    processFrame(inputFrameBuffer: OffscreenCanvas, outputFrameBuffer: HTMLCanvasElement): Promise<void>;
    protected abstract _setBackground(inputFrame: OffscreenCanvas): void;
    private _addMask;
    private _applyAlpha;
    private _createPersonMask;
    private _getResizedInputImageData;
    private _loadJs;
    private _loadTwilioTfLite;
    private _runBodyPixInference;
    private _runTwilioTfLiteInference;
}

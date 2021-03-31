import '@tensorflow/tfjs-backend-webgl';
import '@tensorflow/tfjs-backend-cpu';
import { PersonInferenceConfig } from '@tensorflow-models/body-pix/dist/body_pix_model';
import { Processor } from '../Processor';
import { Benchmark } from '../../utils/Benchmark';
import { Dimensions } from '../../types';
/**
 * @private
 */
export interface BackgroundProcessorOptions {
    /**
     * @private
     */
    inferenceConfig?: PersonInferenceConfig;
    /**
     * The input frame will be downscaled to these dimensions before sending it for inference.
     * @default
     * ```html
     * 224x224
     * ```
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
}
/**
 * @private
 */
export declare abstract class BackgroundProcessor extends Processor {
    private static _model;
    private static _loadModel;
    protected _outputCanvas: OffscreenCanvas;
    protected _outputContext: OffscreenCanvasRenderingContext2D;
    private _benchmark;
    private _inferenceConfig;
    private _inferenceDimensions;
    private _inputCanvas;
    private _inputContext;
    private _maskBlurRadius;
    private _maskCanvas;
    private _maskContext;
    constructor(options?: BackgroundProcessorOptions);
    /**
     * @private
     */
    get benchmark(): Benchmark;
    /**
     * @private
     */
    get inferenceConfig(): PersonInferenceConfig;
    /**
     * @private
     */
    set inferenceConfig(config: PersonInferenceConfig);
    /**
     * The current inference dimensions. The input frame will be
     * downscaled to these dimensions before sending it for inference.
     */
    get inferenceDimensions(): Dimensions;
    /**
     * Set a new inference dimensions. The input frame will be
     * downscaled to these dimensions before sending it for inference.
     */
    set inferenceDimensions(dimensions: Dimensions);
    /**
     * The current blur radius when smoothing out the edges of the person's mask.
     */
    get maskBlurRadius(): number;
    /**
     * Set a new blur radius to be used when smoothing out the edges of the person's mask.
     */
    set maskBlurRadius(radius: number);
    /**
     * Apply a transform to the background of an input video frame and leaving
     * the foreground (person(s)) untouched. Any exception detected will
     * return a null value and will result in the frame being dropped.
     */
    processFrame(inputFrame: OffscreenCanvas): Promise<OffscreenCanvas | null>;
    protected abstract _setBackground(inputFrame: OffscreenCanvas): void;
    private _createPersonMask;
}

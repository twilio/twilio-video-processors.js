import '@tensorflow/tfjs-backend-webgl';
import '@tensorflow/tfjs-backend-cpu';
import { PersonInferenceConfig } from '@tensorflow-models/body-pix/dist/body_pix_model';
import { Processor } from '../Processor';
import { Benchmark } from '../../utils/Benchmark';
import { Resolution } from '../../types';
export interface BackgroundProcessorOptions {
    inferenceConfig?: PersonInferenceConfig;
    inferenceResolution?: Resolution;
    maskBlurRadius?: number;
}
export declare abstract class BackgroundProcessor extends Processor {
    private static _model;
    private static _loadModel;
    protected _outputCanvas: OffscreenCanvas;
    protected _outputContext: OffscreenCanvasRenderingContext2D;
    private _benchmark;
    private _inferenceConfig;
    private _inferenceResolution;
    private _inputCanvas;
    private _inputContext;
    private _maskBlurRadius;
    private _maskCanvas;
    private _maskContext;
    constructor(options?: BackgroundProcessorOptions);
    get benchmark(): Benchmark;
    get inferenceConfig(): PersonInferenceConfig;
    set inferenceConfig(config: PersonInferenceConfig);
    get inferenceResolution(): Resolution;
    set inferenceResolution(resolution: Resolution);
    get maskBlurRadius(): number;
    set maskBlurRadius(radius: number);
    processFrame(inputFrame: OffscreenCanvas): Promise<OffscreenCanvas | null>;
    protected abstract _setBackground(inputFrame: OffscreenCanvas): void;
    private _createPersonMask;
}

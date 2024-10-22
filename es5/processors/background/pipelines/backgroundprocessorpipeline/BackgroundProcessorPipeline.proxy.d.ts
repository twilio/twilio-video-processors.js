import { Remote } from 'comlink';
import { BackgroundProcessorPipeline } from './BackgroundProcessorPipeline';
/**
 * @private
 */
export declare class BackgroundProcessorPipelineProxy {
    protected readonly _pipelineWorkerPromise: Promise<Remote<BackgroundProcessorPipeline>>;
    private readonly _benchmark;
    protected constructor(pipelineWorkerPromise: Promise<Remote<BackgroundProcessorPipeline>>);
    loadTwilioTFLite(): Promise<boolean>;
    render(inputFrame: VideoFrame | ImageBitmap): Promise<ImageBitmap | null>;
    setDeferInputFrameDownscale(defer: boolean): Promise<void>;
    setMaskBlurRadius(radius: number): Promise<void>;
}

import { Remote } from 'comlink';
import { BackgroundProcessorPipelineProxy } from './BackgroundProcessorPipeline.proxy';
import { GaussianBlurBackgroundProcessorPipeline, GaussianBlurBackgroundProcessorPipelineOptions } from './GaussianBlurBackgroundProcessorPipeline';
/**
 * @private
 */
export declare class GaussianBlurBackgroundProcessorPipelineProxy extends BackgroundProcessorPipelineProxy {
    protected readonly _pipelineWorkerPromise: Promise<Remote<GaussianBlurBackgroundProcessorPipeline>>;
    constructor(options: GaussianBlurBackgroundProcessorPipelineOptions);
    setBlurFilterRadius(radius: number): Promise<void>;
}

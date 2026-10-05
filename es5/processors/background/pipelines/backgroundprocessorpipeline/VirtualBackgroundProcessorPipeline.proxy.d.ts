import { Remote } from 'comlink';
import { ImageFit } from '../../../../types';
import { BackgroundProcessorPipelineProxy } from './BackgroundProcessorPipeline.proxy';
import { VirtualBackgroundProcessorPipeline, VirtualBackgroundProcessorPipelineOptions } from './VirtualBackgroundProcessorPipeline';
/**
 * @private
 */
export declare class VirtualBackgroundProcessorPipelineProxy extends BackgroundProcessorPipelineProxy {
    protected readonly _pipelineWorkerPromise: Promise<Remote<VirtualBackgroundProcessorPipeline>>;
    constructor(options: VirtualBackgroundProcessorPipelineOptions);
    setBackgroundImage(backgroundImage: ImageBitmap): Promise<void>;
    setFitType(fitType: ImageFit): Promise<void>;
}

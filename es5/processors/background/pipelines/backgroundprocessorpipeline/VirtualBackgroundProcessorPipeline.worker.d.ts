import { VirtualBackgroundProcessorPipeline } from './VirtualBackgroundProcessorPipeline';
/**
 * @private
 */
export declare class VirtualBackgroundProcessorPipelineWorker extends VirtualBackgroundProcessorPipeline {
    render(inputFrame: VideoFrame): Promise<ImageBitmap | null>;
}

import { GaussianBlurBackgroundProcessorPipeline } from './GaussianBlurBackgroundProcessorPipeline';
/**
 * @private
 */
export declare class GaussianBlurBackgroundProcessorPipelineWorker extends GaussianBlurBackgroundProcessorPipeline {
    render(inputFrame: VideoFrame): Promise<ImageBitmap | null>;
}

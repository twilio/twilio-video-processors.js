import { GaussianBlurBackgroundProcessorPipeline } from './GaussianBlurBackgroundProcessorPipeline';
/**
 * @private
 */
export declare class GaussianBlurBackgroundProcessorPipelineWorker extends GaussianBlurBackgroundProcessorPipeline {
    render(inputFrame: VideoFrame | ImageBitmap): Promise<ImageBitmap | null>;
}

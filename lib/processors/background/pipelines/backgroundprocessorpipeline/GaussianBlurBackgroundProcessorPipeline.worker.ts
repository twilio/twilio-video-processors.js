import { expose, transfer } from 'comlink';
import { GaussianBlurBackgroundProcessorPipeline } from './GaussianBlurBackgroundProcessorPipeline';

export class GaussianBlurBackgroundProcessorPipelineWorker extends GaussianBlurBackgroundProcessorPipeline {
  async render(inputFrame: VideoFrame): Promise<ImageBitmap | null> {
    const outputFrame = await super.render(inputFrame);

    const outputBitmap = outputFrame instanceof OffscreenCanvas
      ? outputFrame.transferToImageBitmap()
      : outputFrame;

    return outputBitmap && transfer(
      outputBitmap,
      [outputBitmap]
    );
  }
}

expose(GaussianBlurBackgroundProcessorPipelineWorker);

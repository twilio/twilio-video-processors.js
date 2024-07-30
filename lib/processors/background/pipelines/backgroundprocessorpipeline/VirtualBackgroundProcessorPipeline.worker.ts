import { expose, transfer } from 'comlink';
import { VirtualBackgroundProcessorPipeline } from './VirtualBackgroundProcessorPipeline';

export class VirtualBackgroundProcessorPipelineWorker extends VirtualBackgroundProcessorPipeline {
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

expose(VirtualBackgroundProcessorPipelineWorker);

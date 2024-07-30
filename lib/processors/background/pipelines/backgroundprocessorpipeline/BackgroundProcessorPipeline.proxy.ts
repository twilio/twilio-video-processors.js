import { Remote, transfer } from 'comlink';
import { BackgroundProcessorPipeline } from './BackgroundProcessorPipeline';

export class BackgroundProcessorPipelineProxy {
  protected readonly _pipelineWorkerPromise: Promise<Remote<BackgroundProcessorPipeline>>;

  protected constructor(
    pipelineWorkerPromise: Promise<Remote<BackgroundProcessorPipeline>>
  ) {
    this._pipelineWorkerPromise = pipelineWorkerPromise;
  }

  async loadTwilioTFLite(): Promise<boolean> {
    const pipelineWorker = await this._pipelineWorkerPromise;
    return pipelineWorker.loadTwilioTFLite();
  }

  async render(inputFrame: VideoFrame): Promise<ImageBitmap | null> {
    const pipelineWorker = await this._pipelineWorkerPromise;
    const outputFrame = await pipelineWorker.render(
      transfer(inputFrame, [inputFrame])
    );
    return outputFrame as ImageBitmap | null;
  }

  async setMaskBlurRadius(radius: number): Promise<void> {
    const pipelineWorker = await this._pipelineWorkerPromise;
    return pipelineWorker.setMaskBlurRadius(radius);
  }
}

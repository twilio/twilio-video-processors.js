import { Remote, transfer, wrap } from 'comlink';
import { TWILIO_GAUSSIAN_BLUR_BACKGROUND_PROCESSOR_PIPELINE_WORKER } from '../../../../constants';
import { BackgroundProcessorPipelineProxy } from './BackgroundProcessorPipeline.proxy';
import { GaussianBlurBackgroundProcessorPipeline, GaussianBlurBackgroundProcessorPipelineOptions } from './GaussianBlurBackgroundProcessorPipeline';

let GaussianBlurBackgroundProcessorPipelineWorker: Remote<typeof GaussianBlurBackgroundProcessorPipeline>;

export class GaussianBlurBackgroundProcessorPipelineProxy extends BackgroundProcessorPipelineProxy {
  protected readonly _pipelineWorkerPromise: Promise<Remote<GaussianBlurBackgroundProcessorPipeline>>;

  constructor(
    options: GaussianBlurBackgroundProcessorPipelineOptions
  ) {
    GaussianBlurBackgroundProcessorPipelineWorker ||= wrap<typeof GaussianBlurBackgroundProcessorPipeline>(
      new Worker(`${options.assetsPath}${TWILIO_GAUSSIAN_BLUR_BACKGROUND_PROCESSOR_PIPELINE_WORKER}`)
    );
    const pipelineWorkerPromise = new GaussianBlurBackgroundProcessorPipelineWorker(options);
    super(pipelineWorkerPromise);
    this._pipelineWorkerPromise = pipelineWorkerPromise;
  }

  async render(inputFrame: VideoFrame): Promise<ImageBitmap | null> {
    const pipelineWorker = await this._pipelineWorkerPromise;
    const outputFrame = await pipelineWorker.render(
      transfer(inputFrame, [inputFrame])
    );
    return outputFrame as (ImageBitmap | null);
  }

  async setBlurFilterRadius(radius: number): Promise<void> {
    const pipelineWorker = await this._pipelineWorkerPromise;
    return pipelineWorker.setBlurFilterRadius(radius);
  }

  async setMaskBlurRadius(radius: number): Promise<void> {
    const pipelineWorker = await this._pipelineWorkerPromise;
    return pipelineWorker.setMaskBlurRadius(radius);
  }
}

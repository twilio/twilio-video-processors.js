import { Remote, wrap } from 'comlink';
import { TWILIO_GAUSSIAN_BLUR_BACKGROUND_PROCESSOR_PIPELINE_WORKER } from '../../../../constants';
import { CorsWorker } from '../../../../utils/CorsWorker';
import { BackgroundProcessorPipelineProxy } from './BackgroundProcessorPipeline.proxy';
import { GaussianBlurBackgroundProcessorPipeline, GaussianBlurBackgroundProcessorPipelineOptions } from './GaussianBlurBackgroundProcessorPipeline';

let GaussianBlurBackgroundProcessorPipelineWorker: Remote<typeof GaussianBlurBackgroundProcessorPipeline>;

/**
 * @private
 */
export class GaussianBlurBackgroundProcessorPipelineProxy extends BackgroundProcessorPipelineProxy {
  protected readonly _pipelineWorkerPromise: Promise<Remote<GaussianBlurBackgroundProcessorPipeline>>;

  constructor(
    options: GaussianBlurBackgroundProcessorPipelineOptions
  ) {
    const corsWorker = new CorsWorker(
      `${options.assetsPath}${TWILIO_GAUSSIAN_BLUR_BACKGROUND_PROCESSOR_PIPELINE_WORKER}`
    );
    const pipelineWorkerPromise = corsWorker.workerPromise.then((worker) => {
      GaussianBlurBackgroundProcessorPipelineWorker ||= wrap<typeof GaussianBlurBackgroundProcessorPipeline>(worker);
      return new GaussianBlurBackgroundProcessorPipelineWorker(options);
    });
    super(pipelineWorkerPromise);
    this._pipelineWorkerPromise = pipelineWorkerPromise;
  }

  async setBlurFilterRadius(radius: number): Promise<void> {
    const pipelineWorker = await this._pipelineWorkerPromise;
    return pipelineWorker.setBlurFilterRadius(radius);
  }
}

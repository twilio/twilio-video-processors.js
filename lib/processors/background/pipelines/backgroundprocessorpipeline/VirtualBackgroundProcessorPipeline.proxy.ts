import { Remote, transfer, wrap } from 'comlink';
import { TWILIO_VIRTUAL_BACKGROUND_PROCESSOR_PIPELINE_WORKER } from '../../../../constants';
import { ImageFit } from '../../../../types';
import { BackgroundProcessorPipelineProxy } from './BackgroundProcessorPipeline.proxy';
import { VirtualBackgroundProcessorPipeline, VirtualBackgroundProcessorPipelineOptions } from './VirtualBackgroundProcessorPipeline';

let VirtualBackgroundProcessorPipelineWorker: Remote<typeof VirtualBackgroundProcessorPipeline>;

/**
 * @private
 */
export class VirtualBackgroundProcessorPipelineProxy extends BackgroundProcessorPipelineProxy {
  protected readonly _pipelineWorkerPromise: Promise<Remote<VirtualBackgroundProcessorPipeline>>;

  constructor(
    options: VirtualBackgroundProcessorPipelineOptions
  ) {
    VirtualBackgroundProcessorPipelineWorker ||= wrap<typeof VirtualBackgroundProcessorPipeline>(
      new Worker(`${options.assetsPath}${TWILIO_VIRTUAL_BACKGROUND_PROCESSOR_PIPELINE_WORKER}`)
    );
    const pipelineWorkerPromise = new VirtualBackgroundProcessorPipelineWorker(options);
    super(pipelineWorkerPromise);
    this._pipelineWorkerPromise = pipelineWorkerPromise;
  }

  async setBackgroundImage(backgroundImage: ImageBitmap): Promise<void> {
    const pipelineWorker = await this._pipelineWorkerPromise;
    return pipelineWorker.setBackgroundImage(
      transfer(backgroundImage, [backgroundImage])
    );
  }

  async setFitType(fitType: ImageFit): Promise<void> {
    const pipelineWorker = await this._pipelineWorkerPromise;
    return pipelineWorker.setFitType(fitType);
  }
}

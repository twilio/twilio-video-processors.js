import { Remote, transfer } from 'comlink';
import { Benchmark } from '../../../../utils/Benchmark';
import { BackgroundProcessorPipeline } from './BackgroundProcessorPipeline';

/**
 * @private
 */
export class BackgroundProcessorPipelineProxy {
  protected readonly _pipelineWorkerPromise: Promise<Remote<BackgroundProcessorPipeline>>;
  private readonly _benchmark: Benchmark = new Benchmark();

  protected constructor(
    pipelineWorkerPromise: Promise<Remote<BackgroundProcessorPipeline>>
  ) {
    this._pipelineWorkerPromise = pipelineWorkerPromise;
  }

  async loadTwilioTFLite(): Promise<boolean> {
    const pipelineWorker = await this._pipelineWorkerPromise;
    return pipelineWorker.loadTwilioTFLite();
  }

  async render(inputFrame: VideoFrame | ImageBitmap): Promise<ImageBitmap | null> {
    const pipelineWorker = await this._pipelineWorkerPromise;
    const outputFrame = await pipelineWorker.render(
      transfer(inputFrame, [inputFrame])
    );
    // @ts-ignore
    this._benchmark.merge(await pipelineWorker._benchmark);
    return outputFrame as ImageBitmap | null;
  }

  async setDeferInputFrameDownscale(defer: boolean): Promise<void> {
    const pipelineWorker = await this._pipelineWorkerPromise;
    return pipelineWorker.setDeferInputFrameDownscale(defer);
  }

  async setMaskBlurRadius(radius: number): Promise<void> {
    const pipelineWorker = await this._pipelineWorkerPromise;
    return pipelineWorker.setMaskBlurRadius(radius);
  }
}

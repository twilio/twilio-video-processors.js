import { InputFrame } from '../../../types';
import { Pipeline } from '../Pipeline';
import { WebGL2PipelineInputStage } from './WebGL2PipelineInputStage';
import { WebGL2PipelineProcessingStage } from './WebGL2PipelineProcessingStage';

/**
 * @private
 */
export class WebGL2Pipeline extends Pipeline {
  static InputStage = WebGL2PipelineInputStage;
  static ProcessingStage = WebGL2PipelineProcessingStage;
  protected readonly _stages: (WebGL2PipelineInputStage | WebGL2PipelineProcessingStage)[] = [];

  cleanUp(): void {
    this._stages.forEach(
      (stage) => stage.cleanUp()
    );
  }

  render(
    inputFrame?: InputFrame,
    inputTextureData?: ImageData
  ): void {
    const [inputStage, ...otherStages] = this._stages;
    inputStage.render(inputFrame, inputTextureData);
    otherStages.forEach(
      (stage) => (stage as WebGL2PipelineProcessingStage)
        .render()
    );
  }
}

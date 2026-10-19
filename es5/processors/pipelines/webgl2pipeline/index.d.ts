import { InputFrame } from '../../../types';
import { Pipeline } from '../Pipeline';
import { WebGL2PipelineInputStage } from './WebGL2PipelineInputStage';
import { WebGL2PipelineProcessingStage } from './WebGL2PipelineProcessingStage';
/**
 * @private
 */
export declare class WebGL2Pipeline extends Pipeline {
    static InputStage: typeof WebGL2PipelineInputStage;
    static ProcessingStage: typeof WebGL2PipelineProcessingStage;
    protected readonly _stages: (WebGL2PipelineInputStage | WebGL2PipelineProcessingStage)[];
    cleanUp(): void;
    render(inputFrame?: InputFrame, inputTextureData?: ImageData): void;
}

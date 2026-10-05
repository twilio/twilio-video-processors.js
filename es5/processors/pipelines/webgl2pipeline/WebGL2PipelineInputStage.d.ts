import { InputFrame } from '../../../types';
import { Pipeline } from '../Pipeline';
/**
 * @private
 */
export declare class WebGL2PipelineInputStage implements Pipeline.Stage {
    private readonly _glOut;
    private readonly _inputFrameTexture;
    private _inputTexture;
    constructor(glOut: WebGL2RenderingContext);
    cleanUp(): void;
    render(inputFrame?: InputFrame, inputTextureData?: ImageData): void;
}

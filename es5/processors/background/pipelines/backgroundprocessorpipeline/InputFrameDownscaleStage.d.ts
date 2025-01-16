import { InputFrame } from '../../../../types';
import { Pipeline } from '../../../pipelines';
/**
 * @private
 */
export declare class InputFrameDowscaleStage implements Pipeline.Stage {
    private readonly _inputFrameDownscaleMode;
    private readonly _outputContext;
    constructor(outputCanvas: OffscreenCanvas, inputFrameDownscaleMode: 'canvas' | 'image-bitmap');
    render(inputFrame: InputFrame): Promise<Uint8ClampedArray>;
}

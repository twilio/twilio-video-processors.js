import { InputFrame } from '../../../../types';
import { Pipeline } from '../../../pipelines';
/**
 * Downscales the input frame to the dimensions of the output canvas using the specified mode and returns the pixel data
 * @params outputCanvas - The canvas to draw the downscaled image to
 * @params inputFrameDownscaleMode - The mode to downscale the input frame to
 * @private
 */
export declare class InputFrameDowscaleStage implements Pipeline.Stage {
    private readonly _inputFrameDownscaleMode;
    private readonly _outputContext;
    constructor(outputCanvas: OffscreenCanvas, inputFrameDownscaleMode: 'canvas' | 'image-bitmap');
    render(inputFrame: InputFrame): Promise<Uint8ClampedArray>;
}

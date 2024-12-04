import { Dimensions, InputFrame } from '../../../../types';
import { Pipeline } from '../../../pipelines';
/**
 * @private
 */
export declare class PostProcessingStage implements Pipeline.Stage {
    private readonly _inputDimensions;
    private _maskBlurRadius;
    private readonly _outputContext;
    private _personMaskUpscalePipeline;
    private readonly _setBackground;
    private readonly _webgl2Canvas;
    constructor(inputDimensions: Dimensions, webgl2Canvas: OffscreenCanvas, outputCanvas: OffscreenCanvas, maskBlurRadius: number, setBackground: (inputFrame?: InputFrame) => void);
    render(inputFrame: InputFrame, personMask: ImageData): void;
    resetPersonMaskUpscalePipeline(): void;
    updateMaskBlurRadius(radius: number): void;
}

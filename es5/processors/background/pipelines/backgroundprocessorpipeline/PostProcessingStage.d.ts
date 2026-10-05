import { Dimensions, HysteresisConfig, InputFrame } from '../../../../types';
import { Pipeline } from '../../../pipelines';
/**
 * @private
 */
export declare class PostProcessingStage implements Pipeline.Stage {
    private _hysteresisEnabled;
    private _hysteresisHigh;
    private _hysteresisLow;
    private readonly _inputDimensions;
    private _maskBlurRadius;
    private readonly _outputContext;
    private _personMaskUpscalePipeline;
    private _prevMaskData;
    private readonly _setBackground;
    private readonly _webgl2Canvas;
    constructor(inputDimensions: Dimensions, webgl2Canvas: OffscreenCanvas, outputCanvas: OffscreenCanvas, maskBlurRadius: number, setBackground: (inputFrame?: InputFrame) => void, hysteresis?: false | HysteresisConfig);
    render(inputFrame: InputFrame, personMask: ImageData): void;
    resetPersonMaskUpscalePipeline(): void;
    updateHysteresis(config: false | HysteresisConfig): void;
    updateMaskBlurRadius(radius: number): void;
    private _applyHysteresis;
}

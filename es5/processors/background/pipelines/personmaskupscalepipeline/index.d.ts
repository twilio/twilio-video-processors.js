import { BilateralFilterConfig, Dimensions, InputFrame } from '../../../../types';
import { WebGL2Pipeline } from '../../../pipelines';
/**
 * @private
 */
export declare class PersonMaskUpscalePipeline extends WebGL2Pipeline {
    private readonly _outputCanvas;
    private readonly _inputDimensions;
    private _isWebGL2Supported;
    private _maskBlurRadius;
    constructor(inputDimensions: Dimensions, outputCanvas: OffscreenCanvas | HTMLCanvasElement, maskBlurRadius: number);
    private initializeWebGL2Pipeline;
    render(inputFrame: InputFrame, personMask: ImageData): void;
    /**
     * Render the person mask using a Canvas 2D context as a fallback for browsers without WebGL2 support
     * @param inputFrame - The input frame to render
     * @param personMask - The person mask to render
     */
    private _renderFallback;
    updateBilateralFilterConfig(config: BilateralFilterConfig): void;
    cleanUp(): void;
}

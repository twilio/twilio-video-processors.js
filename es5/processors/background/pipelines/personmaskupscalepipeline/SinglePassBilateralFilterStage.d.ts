import { Dimensions } from '../../../../types';
import { WebGL2Pipeline } from '../../../pipelines';
/**
 * @private
 */
export declare class SinglePassBilateralFilterStage extends WebGL2Pipeline.ProcessingStage {
    private readonly _direction;
    private readonly _inputDimensions;
    constructor(glOut: WebGL2RenderingContext, direction: 'horizontal' | 'vertical', outputType: 'canvas' | 'texture', inputDimensions: Dimensions, outputDimensions: Dimensions, inputTextureUnit: number, outputTextureUnit?: number);
    updateSigmaColor(sigmaColor: number): void;
    updateSigmaSpace(sigmaSpace: number): void;
}

import { BilateralFilterConfig, Dimensions } from '../../../../types';
import { WebGL2Pipeline } from '../../../pipelines';
/**
 * @private
 */
export declare class PersonMaskUpscalePipeline extends WebGL2Pipeline {
    constructor(inputDimensions: Dimensions, outputCanvas: OffscreenCanvas | HTMLCanvasElement);
    updateBilateralFilterConfig(config: BilateralFilterConfig): void;
}

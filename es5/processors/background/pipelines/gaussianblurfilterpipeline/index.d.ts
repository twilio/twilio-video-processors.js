import { WebGL2Pipeline } from '../../../pipelines';
/**
 * @private
 */
export declare class GaussianBlurFilterPipeline extends WebGL2Pipeline {
    constructor(outputCanvas: OffscreenCanvas | HTMLCanvasElement);
    updateRadius(radius: number): void;
}

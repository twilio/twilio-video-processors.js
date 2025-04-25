import { WebGL2Pipeline } from '../../../pipelines';
/**
 * @private
 */
export declare class GaussianBlurFilterPipeline extends WebGL2Pipeline {
    private _isWebGL2Supported;
    private _outputCanvas;
    private _blurFilterRadius;
    constructor(outputCanvas: OffscreenCanvas | HTMLCanvasElement, blurFilterRadius: number);
    render(): void;
    private _renderFallback;
    private initializeWebGL2Pipeline;
    updateRadius(radius: number): void;
    cleanUp(): void;
}

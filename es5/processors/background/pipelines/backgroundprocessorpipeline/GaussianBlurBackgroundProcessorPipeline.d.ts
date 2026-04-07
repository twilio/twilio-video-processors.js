import { InputFrame } from '../../../../types';
import { BackgroundProcessorPipeline, BackgroundProcessorPipelineOptions } from './BackgroundProcessorPipeline';
/**
 * @private
 */
export interface GaussianBlurBackgroundProcessorPipelineOptions extends BackgroundProcessorPipelineOptions {
    blurFilterRadius: number;
}
/**
 * @private
 */
export declare class GaussianBlurBackgroundProcessorPipeline extends BackgroundProcessorPipeline {
    private _blurFilterRadius;
    private _gaussianBlurFilterPipeline;
    constructor(options: GaussianBlurBackgroundProcessorPipelineOptions);
    setBlurFilterRadius(radius: number): Promise<void>;
    protected _setBackground(inputFrame: InputFrame): void;
    private _resetGaussianBlurFilterPipeline;
}

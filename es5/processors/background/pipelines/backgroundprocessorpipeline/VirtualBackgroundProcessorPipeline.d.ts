import { ImageFit } from '../../../../types';
import { BackgroundProcessorPipeline, BackgroundProcessorPipelineOptions } from './BackgroundProcessorPipeline';
/**
 * @private
 */
export interface VirtualBackgroundProcessorPipelineOptions extends BackgroundProcessorPipelineOptions {
    fitType: ImageFit;
}
/**
 * @private
 */
export declare class VirtualBackgroundProcessorPipeline extends BackgroundProcessorPipeline {
    private _backgroundImage;
    private _fitType;
    constructor(options: VirtualBackgroundProcessorPipelineOptions);
    setBackgroundImage(backgroundImage: ImageBitmap): Promise<void>;
    setFitType(fitType: ImageFit): Promise<void>;
    protected _setBackground(): void;
    private _getFitPosition;
}

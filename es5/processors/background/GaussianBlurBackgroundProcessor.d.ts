import { BackgroundProcessor, BackgroundProcessorOptions } from './BackgroundProcessor';
export interface GaussianBlurBackgroundProcessorOptions extends BackgroundProcessorOptions {
    blurFilterRadius?: number;
}
export declare class GaussianBlurBackgroundProcessor extends BackgroundProcessor {
    private _blurFilterRadius;
    constructor(options?: GaussianBlurBackgroundProcessorOptions);
    get blurFilterRadius(): number;
    set blurFilterRadius(radius: number);
    protected _setBackground(inputFrame: OffscreenCanvas): void;
}

import { BackgroundProcessor, BackgroundProcessorOptions } from './BackgroundProcessor';
import { ImageFit } from '../../types';
export interface VirtualBackgroundProcessorOptions extends BackgroundProcessorOptions {
    backgroundImage: HTMLImageElement;
    fitType?: ImageFit;
}
export declare class VirtualBackgroundProcessor extends BackgroundProcessor {
    private _backgroundImage;
    private _fitType;
    constructor(options: VirtualBackgroundProcessorOptions);
    get backgroundImage(): HTMLImageElement;
    set backgroundImage(image: HTMLImageElement);
    get fitType(): ImageFit;
    set fitType(fitType: ImageFit);
    protected _setBackground(): void;
    private _getFitPosition;
}

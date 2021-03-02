import { BackgroundProcessor, BackgroundProcessorOptions } from './BackgroundProcessor';
import { ImageFit } from '../../types';

export interface VirtualBackgroundProcessorOptions extends BackgroundProcessorOptions {
  backgroundImage: HTMLImageElement;
  fitType?: ImageFit;
}

export class VirtualBackgroundProcessor extends BackgroundProcessor {

  private _backgroundImage!: HTMLImageElement;
  private _fitType!: ImageFit;

  constructor(options: VirtualBackgroundProcessorOptions) {
    super(options);
    this.backgroundImage = options.backgroundImage;
    this.fitType = options.fitType!;
  }

  get backgroundImage(): HTMLImageElement {
    return this._backgroundImage;
  }

  set backgroundImage(image: HTMLImageElement) {
    if (!image || !image.complete || !image.naturalHeight) {
      throw new Error('Invalid image. Image must be a HTMLImageElement and that the browser has finished loading it');
    }
    this._backgroundImage = image;
  }

  get fitType(): ImageFit {
    return this._fitType;
  }

  set fitType(fitType: ImageFit) {
    const validTypes = Object.keys(ImageFit);
    if (!validTypes.includes(fitType as any)) {
      console.warn(`Valid fitType not found. Using '${ImageFit.Fill}' as default.`);
      fitType = ImageFit.Fill;
    }
    this._fitType = fitType;
  }

  protected _setBackground(inputFrame: OffscreenCanvas): void {
    this._outputContext.drawImage(this._backgroundImage, 0, 0, inputFrame.width, inputFrame.height);
  }
}

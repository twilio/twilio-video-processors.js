import { BackgroundProcessor, BackgroundProcessorOptions } from './BackgroundProcessor';
import { DEFAULT_BLUR_FILTER_RADIUS } from '../../constants';

export interface GaussianBlurBackgroundProcessorOptions extends BackgroundProcessorOptions {
  blurFilterRadius?: number;
}

export class GaussianBlurBackgroundProcessor extends BackgroundProcessor {

  private _blurFilterRadius: number = DEFAULT_BLUR_FILTER_RADIUS;

  constructor(options?: GaussianBlurBackgroundProcessorOptions) {
    super(options);
    this.blurFilterRadius = options?.blurFilterRadius!;
  }

  get blurFilterRadius(): number {
    return this._blurFilterRadius;
  }

  set blurFilterRadius(radius: number) {
    if (!radius) {
      console.warn(`Valid blur filter radius not found. Using ${DEFAULT_BLUR_FILTER_RADIUS} as default.`);
      radius = DEFAULT_BLUR_FILTER_RADIUS;
    }
    this._blurFilterRadius = radius;
  }

  protected _setBackground(inputFrame: OffscreenCanvas): void {
    this._outputContext.filter = `blur(${this._blurFilterRadius}px)`;
    this._outputContext.drawImage(inputFrame, 0, 0);
  }
}

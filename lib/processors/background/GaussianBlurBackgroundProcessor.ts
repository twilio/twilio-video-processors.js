import { BackgroundProcessor, BackgroundProcessorOptions } from './BackgroundProcessor';
import { DEFAULT_BLUR_FILTER_RADIUS } from '../../constants';

/**
 * Options passed to [[GaussianBlurBackgroundProcessor]] constructor.
 */
export interface GaussianBlurBackgroundProcessorOptions extends BackgroundProcessorOptions {
  /**
   * The background blur filter radius to use in pixels.
   * @default
   * ```html
   * 5
   * ```
   */
  blurFilterRadius?: number;
}

/**
 * The GaussianBlurBackgroundProcessor, when added to a VideoTrack,
 * applies a gaussian blur filter on the background in each video frame
 * and leaving the foreground (person(s)) untouched.
 *
 * @example
 *
 * ```ts
 * import { createLocalVideoTrack } from 'twilio-video';
 * import { GaussianBlurBackgroundProcessor } from '@twilio/video-processors';
 *
 * const blurBackground = new GaussianBlurBackgroundProcessor();
 *
 * createLocalVideoTrack({
 *   width: 640,
 *   height: 480
 * }).then(track => {
 *   track.addProcessor(blurBackground);
 * });
 * ```
 */
export class GaussianBlurBackgroundProcessor extends BackgroundProcessor {

  private _blurFilterRadius: number = DEFAULT_BLUR_FILTER_RADIUS;

  /**
   * Construct a GaussianBlurBackgroundProcessor. Default values will be used for
   * any invalid or missing [[GaussianBlurBackgroundProcessorOptions]]
   */
  constructor(options?: GaussianBlurBackgroundProcessorOptions) {
    super(options);
    this.blurFilterRadius = options?.blurFilterRadius!;
  }

  /**
   * The current background blur filter radius in pixels.
   */
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

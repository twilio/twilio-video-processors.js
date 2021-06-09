import { BackgroundProcessor, BackgroundProcessorOptions } from './BackgroundProcessor';
import { ImageFit } from '../../types';

/**
 * Options passed to [[VirtualBackgroundProcessor]] constructor.
 */
export interface VirtualBackgroundProcessorOptions extends BackgroundProcessorOptions {
  /**
   * The HTMLImageElement to use for background replacement.
   * An error will be raised if the image hasn't been fully loaded yet. Additionally, the image must follow
   * [security guidelines](https://developer.mozilla.org/en-US/docs/Web/HTML/CORS_enabled_image)
   * when loading the image from a different origin. Failing to do so will result to an empty output frame.
   */
  backgroundImage: HTMLImageElement;

  /**
   * The [[ImageFit]] to use for positioning of the background image in the viewport.
   * @default
   * ```html
   * 'Fill'
   * ```
   */
  fitType?: ImageFit;
}

/**
 * The VirtualBackgroundProcessor, when added to a VideoTrack,
 * replaces the background in each video frame with a given image,
 * and leaves the foreground (person(s)) untouched. Each instance of
 * VirtualBackgroundProcessor should be added to only one VideoTrack
 * at a time to prevent overlapping of image data from multiple VideoTracks.
 *
 * @example
 *
 * ```ts
 * import { createLocalVideoTrack } from 'twilio-video';
 * import { VirtualBackgroundProcessor } from '@twilio/video-processors-sdk';
 *
 * let virtualBackground;
 * const img = new Image();
 *
 * img.onload = () => {
 *   virtualBackground = new VirtualBackgroundProcessor({
 *     assetsPath: 'https://my-server-path/assets',
 *     backgroundImage: img,
 *   });
 *
 *   await virtualBackground.loadModel();
 *
 *   createLocalVideoTrack({
 *     width: 640,
 *     height: 480
 *   }).then(track => {
 *     track.addProcessor(virtualBackground);
 *   });
 * };
 * img.src = '/background.jpg';
 * ```
 */
export class VirtualBackgroundProcessor extends BackgroundProcessor {

  private _backgroundImage!: HTMLImageElement;
  private _fitType!: ImageFit;
  // tslint:disable-next-line no-unused-variable
  private readonly _name: string = 'VirtualBackgroundProcessor';

  /**
   * Construct a VirtualBackgroundProcessor. Default values will be used for
   * any missing optional properties in [[VirtualBackgroundProcessorOptions]],
   * and invalid properties will be ignored.
   */
  constructor(options: VirtualBackgroundProcessorOptions) {
    super(options);
    this.backgroundImage = options.backgroundImage;
    this.fitType = options.fitType!;
  }

  /**
   * The HTMLImageElement representing the current background image.
   */
  get backgroundImage(): HTMLImageElement {
    return this._backgroundImage;
  }

  /**
   * Set an HTMLImageElement as the new background image.
   * An error will be raised if the image hasn't been fully loaded yet. Additionally, the image must follow
   * [security guidelines](https://developer.mozilla.org/en-US/docs/Web/HTML/CORS_enabled_image)
   * when loading the image from a different origin. Failing to do so will result to an empty output frame.
   */
  set backgroundImage(image: HTMLImageElement) {
    if (!image || !image.complete || !image.naturalHeight) {
      throw new Error('Invalid image. Make sure that the image is an HTMLImageElement and has been successfully loaded');
    }
    this._backgroundImage = image;
  }

  /**
   * The current [[ImageFit]] for positioning of the background image in the viewport.
   */
  get fitType(): ImageFit {
    return this._fitType;
  }

  /**
   * Set a new [[ImageFit]] to be used for positioning the background image in the viewport.
   */
  set fitType(fitType: ImageFit) {
    const validTypes = Object.keys(ImageFit);
    if (!validTypes.includes(fitType as any)) {
      console.warn(`Valid fitType not found. Using '${ImageFit.Fill}' as default.`);
      fitType = ImageFit.Fill;
    }
    this._fitType = fitType;
  }

  protected _setBackground(): void {
    const img = this._backgroundImage;
    const imageWidth = img.naturalWidth;
    const imageHeight = img.naturalHeight;
    const canvasWidth = this._outputCanvas.width;
    const canvasHeight = this._outputCanvas.height;

    if (this._fitType === ImageFit.Fill) {
      this._outputContext.drawImage(img, 0, 0, imageWidth, imageHeight, 0, 0, canvasWidth, canvasHeight);
    } else if (this._fitType === ImageFit.None) {
      this._outputContext.drawImage(img, 0, 0, imageWidth, imageHeight);
    } else if (this._fitType === ImageFit.Contain) {
      const { x, y, w, h } = this._getFitPosition(imageWidth, imageHeight, canvasWidth, canvasHeight, ImageFit.Contain);
      this._outputContext.drawImage(img, 0, 0, imageWidth, imageHeight, x, y, w, h);
    } else if (this._fitType === ImageFit.Cover) {
      const { x, y, w, h } = this._getFitPosition(imageWidth, imageHeight, canvasWidth, canvasHeight, ImageFit.Cover);
      this._outputContext.drawImage(img, 0, 0, imageWidth, imageHeight, x, y, w, h);
    }
  }

  private _getFitPosition(contentWidth: number, contentHeight: number,
    viewportWidth: number, viewportHeight: number, type: ImageFit)
      : { h: number, w: number, x: number, y: number } {

    // Calculate new content width to fit viewport width
    let factor = viewportWidth / contentWidth;
    let newContentWidth = viewportWidth;
    let newContentHeight = factor * contentHeight;

    // Scale down the resulting height and width more
    // to fit viewport height if the content still exceeds it
    if ((type === ImageFit.Contain && newContentHeight > viewportHeight)
      || (type === ImageFit.Cover && viewportHeight > newContentHeight)) {
      factor = viewportHeight / newContentHeight;
      newContentWidth = factor * newContentWidth;
      newContentHeight = viewportHeight;
    }

    // Calculate the destination top left corner to center the content
    const x = (viewportWidth - newContentWidth) / 2;
    const y = (viewportHeight - newContentHeight) / 2;

    return {
      x, y,
      w: newContentWidth,
      h: newContentHeight,
    };
  }
}

import { ImageFit } from '../../types';
import { MASK_BLUR_RADIUS } from '../../constants';
import { isChromiumImageBitmap } from '../../utils/support';
import { BackgroundProcessor, BackgroundProcessorOptions } from './BackgroundProcessor';
import { VirtualBackgroundProcessorPipeline, VirtualBackgroundProcessorPipelineProxy } from './pipelines/backgroundprocessorpipeline';

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
   * The [[ImageFit]] to use for positioning of the background image in the viewport. Only the Canvas2D [[Pipeline]]
   * supports this option. WebGL2 ignores this option and falls back to Cover.
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
 * import { Pipeline, VirtualBackgroundProcessor } from '@twilio/video-processors';
 * import { simd } from 'wasm-feature-detect';
 *
 * let virtualBackground: VirtualBackgroundProcessor;
 * const img = new Image();
 *
 * img.onload = async () => {
 *   const isWasmSimdSupported = await simd();
 *
 *   virtualBackground = new VirtualBackgroundProcessor({
 *     assetsPath: 'https://my-server-path/assets',
 *     backgroundImage: img,
 *
 *     // Enable debounce only if the browser does not support
 *     // WASM SIMD in order to retain an acceptable frame rate.
 *     debounce: !isWasmSimdSupported,
 *
 *     pipeline: Pipeline.WebGL2,
 *   });
 *   await virtualBackground.loadModel();
 *
 *   const track = await createLocalVideoTrack({
 *     // Increasing the capture resolution decreases the output FPS
 *     // especially on browsers that do not support SIMD
 *     // such as desktop Safari and iOS browsers, or on Chrome
 *     // with capture resolutions above 640x480 for webgl2.
 *     width: 640,
 *     height: 480,
 *
 *     // Any frame rate above 24 fps on desktop browsers increase CPU
 *     // usage without noticeable increase in quality.
 *     frameRate: 24
 *   });
 *   track.addProcessor(virtualBackground, {
 *     inputFrameBufferType: 'video',
 *     outputFrameBufferContextType: 'webgl2',
 *   });
 * };
 *
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
    const {
      backgroundImage,
      fitType = ImageFit.Fill,
      maskBlurRadius = MASK_BLUR_RADIUS,
      useWebWorker = false
    } = options;

    const assetsPath = options
      .assetsPath
      .replace(/([^/])$/, '$1/');

    const backgroundProcessorPipeline = new (
      useWebWorker && isChromiumImageBitmap()
        ? VirtualBackgroundProcessorPipelineProxy
        : VirtualBackgroundProcessorPipeline
    )({
      assetsPath,
      fitType,
      maskBlurRadius
    });

    super(
      backgroundProcessorPipeline,
      options
    );

    this.backgroundImage = backgroundImage;
    this.fitType = fitType;
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
    createImageBitmap(this._backgroundImage).then(
      (imageBitmap) => (this._backgroundProcessorPipeline as VirtualBackgroundProcessorPipeline | VirtualBackgroundProcessorPipelineProxy)
        .setBackgroundImage(imageBitmap)
    ).catch(() => {
      /* noop */
    });
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
    (this._backgroundProcessorPipeline as VirtualBackgroundProcessorPipeline | VirtualBackgroundProcessorPipelineProxy)
      .setFitType(this._fitType)
      .catch(() => {
        /* noop */
      });
  }
}

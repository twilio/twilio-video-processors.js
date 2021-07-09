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
 * import { VirtualBackgroundProcessor } from '@twilio/video-processors';
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
 *   virtualBackground.loadModel().then(() => {
 *     createLocalVideoTrack({
 *       width: 640,
 *       height: 480,
 *       frameRate: 24
 *     }).then(track => {
 *       track.addProcessor(virtualBackground);
 *     });
 *   });
 * };
 * img.src = '/background.jpg';
 * ```
 */
export declare class VirtualBackgroundProcessor extends BackgroundProcessor {
    private _backgroundImage;
    private _fitType;
    private readonly _name;
    /**
     * Construct a VirtualBackgroundProcessor. Default values will be used for
     * any missing optional properties in [[VirtualBackgroundProcessorOptions]],
     * and invalid properties will be ignored.
     */
    constructor(options: VirtualBackgroundProcessorOptions);
    /**
     * The HTMLImageElement representing the current background image.
     */
    get backgroundImage(): HTMLImageElement;
    /**
     * Set an HTMLImageElement as the new background image.
     * An error will be raised if the image hasn't been fully loaded yet. Additionally, the image must follow
     * [security guidelines](https://developer.mozilla.org/en-US/docs/Web/HTML/CORS_enabled_image)
     * when loading the image from a different origin. Failing to do so will result to an empty output frame.
     */
    set backgroundImage(image: HTMLImageElement);
    /**
     * The current [[ImageFit]] for positioning of the background image in the viewport.
     */
    get fitType(): ImageFit;
    /**
     * Set a new [[ImageFit]] to be used for positioning the background image in the viewport.
     */
    set fitType(fitType: ImageFit);
    protected _setBackground(): void;
    private _getFitPosition;
}

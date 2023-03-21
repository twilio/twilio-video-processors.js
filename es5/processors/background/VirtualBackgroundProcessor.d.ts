import { BackgroundProcessor, BackgroundProcessorOptions } from './BackgroundProcessor';
import { ImageFit, WebGL2PipelineType } from '../../types';
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
 * import { Pipeline, VirtualBackgroundProcessor } from '@twilio/video-processors';
 *
 * let virtualBackground;
 * const img = new Image();
 *
 * img.onload = () => {
 *   virtualBackground = new VirtualBackgroundProcessor({
 *     assetsPath: 'https://my-server-path/assets',
 *     backgroundImage: img,
 *     pipeline: Pipeline.WebGL2,
 *
 *     // Desktop Safari and iOS browsers do not support SIMD.
 *     // Set debounce to true to achieve an acceptable performance.
 *     debounce: isSafari(),
 *   });
 *
 *   virtualBackground.loadModel().then(() => {
 *     createLocalVideoTrack({
 *       // Increasing the capture resolution decreases the output FPS
 *       // especially on browsers that do not support SIMD
 *       // such as desktop Safari and iOS browsers
 *       width: 640,
 *       height: 480,
 *       // Any frame rate above 24 fps on desktop browsers increase CPU
 *       // usage without noticeable increase in quality.
 *       frameRate: 24
 *     }).then(track => {
 *       track.addProcessor(virtualBackground, {
 *         inputFrameBufferType: 'video',
 *         outputFrameBufferContextType: 'webgl2',
 *       });
 *     });
 *   });
 * };
 * img.src = '/background.jpg';
 * ```
 */
export declare class VirtualBackgroundProcessor extends BackgroundProcessor {
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
    protected _getWebGL2PipelineType(): WebGL2PipelineType;
    protected _setBackground(): void;
    private _getFitPosition;
}

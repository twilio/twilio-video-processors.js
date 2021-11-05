import { BackgroundProcessor, BackgroundProcessorOptions } from './BackgroundProcessor';
/**
 * Options passed to [[GaussianBlurBackgroundProcessor]] constructor.
 */
export interface GaussianBlurBackgroundProcessorOptions extends BackgroundProcessorOptions {
    /**
     * The background blur filter radius to use in pixels.
     * @default
     * ```html
     * 15
     * ```
     */
    blurFilterRadius?: number;
}
/**
 * The GaussianBlurBackgroundProcessor, when added to a VideoTrack,
 * applies a gaussian blur filter on the background in each video frame
 * and leaves the foreground (person(s)) untouched. Each instance of
 * GaussianBlurBackgroundProcessor should be added to only one VideoTrack
 * at a time to prevent overlapping of image data from multiple VideoTracks.
 *
 * @example
 *
 * ```ts
 * import { createLocalVideoTrack } from 'twilio-video';
 * import { GaussianBlurBackgroundProcessor } from '@twilio/video-processors';
 *
 * const blurBackground = new GaussianBlurBackgroundProcessor({
 *   assetsPath: 'https://my-server-path/assets'
 * });
 *
 * blurBackground.loadModel().then(() => {
 *   createLocalVideoTrack({
 *     width: 640,
 *     height: 480,
 *     frameRate: 24
 *   }).then(track => {
 *     track.addProcessor(blurBackground);
 *   });
 * });
 * ```
 */
export declare class GaussianBlurBackgroundProcessor extends BackgroundProcessor {
    private _blurFilterRadius;
    private readonly _name;
    /**
     * Construct a GaussianBlurBackgroundProcessor. Default values will be used for
     * any missing properties in [[GaussianBlurBackgroundProcessorOptions]], and
     * invalid properties will be ignored.
     */
    constructor(options: GaussianBlurBackgroundProcessorOptions);
    /**
     * The current background blur filter radius in pixels.
     */
    get blurFilterRadius(): number;
    /**
     * Set a new background blur filter radius in pixels.
     */
    set blurFilterRadius(radius: number);
    protected _setBackground(inputFrame: OffscreenCanvas): void;
}

import { BackgroundProcessor, BackgroundProcessorOptions } from './BackgroundProcessor';
import { WebGL2PipelineType } from '../../types';
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
 * import { Pipeline, GaussianBlurBackgroundProcessor } from '@twilio/video-processors';
 *
 * const blurBackground = new GaussianBlurBackgroundProcessor({
 *   assetsPath: 'https://my-server-path/assets',
 *   pipeline: Pipeline.WebGL2,
 *   debounce: true,
 * });
 *
 * blurBackground.loadModel().then(() => {
 *   createLocalVideoTrack({
 *     // Increasing the capture resolution decreases the output FPS
 *     // especially on browsers that do not support SIMD
 *     // such as desktop Safari and iOS browsers
 *     width: 640,
 *     height: 480,
 *     // Any frame rate above 24 fps on desktop browsers increase CPU
 *     // usage without noticeable increase in quality.
 *     frameRate: 24
 *   }).then(track => {
 *     track.addProcessor(blurBackground, {
 *       inputFrameBufferType: 'video',
 *       outputFrameBufferContextType: 'webgl2',
 *     });
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
    protected _getWebGL2PipelineType(): WebGL2PipelineType;
    protected _setBackground(inputFrame: OffscreenCanvas | HTMLCanvasElement | HTMLVideoElement): void;
}

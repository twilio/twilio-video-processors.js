"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.GaussianBlurBackgroundProcessor = void 0;
var constants_1 = require("../../constants");
var BackgroundProcessor_1 = require("./BackgroundProcessor");
var backgroundprocessorpipeline_1 = require("./pipelines/backgroundprocessorpipeline");
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
 * let blurBackground: GaussianBlurBackgroundProcessor;
 *
 * (async() => {
 *   blurBackground = new GaussianBlurBackgroundProcessor({
 *     assetsPath: 'https://my-server-path/assets'
 *   });
 *   await blurBackground.loadModel();
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
 *     inputFrameBufferType: 'videoframe',
 *     outputFrameBufferContextType: 'bitmaprenderer'
 *   });
 * })();
 * ```
 */
var GaussianBlurBackgroundProcessor = /** @class */ (function (_super) {
    __extends(GaussianBlurBackgroundProcessor, _super);
    /**
     * Construct a GaussianBlurBackgroundProcessor. Default values will be used for
     * any missing properties in [[GaussianBlurBackgroundProcessorOptions]], and
     * invalid properties will be ignored.
     */
    function GaussianBlurBackgroundProcessor(options) {
        var _this = this;
        var _a = options.blurFilterRadius, blurFilterRadius = _a === void 0 ? constants_1.BLUR_FILTER_RADIUS : _a, _b = options.deferInputFrameDownscale, deferInputFrameDownscale = _b === void 0 ? false : _b, _c = options.maskBlurRadius, maskBlurRadius = _c === void 0 ? constants_1.MASK_BLUR_RADIUS : _c, _d = options.useWebWorker, useWebWorker = _d === void 0 ? true : _d;
        var assetsPath = options
            .assetsPath
            .replace(/([^/])$/, '$1/');
        var BackgroundProcessorPipelineOrProxy = useWebWorker
            ? backgroundprocessorpipeline_1.GaussianBlurBackgroundProcessorPipelineProxy
            : backgroundprocessorpipeline_1.GaussianBlurBackgroundProcessorPipeline;
        var backgroundProcessorPipeline = new BackgroundProcessorPipelineOrProxy({
            assetsPath: assetsPath,
            blurFilterRadius: blurFilterRadius,
            deferInputFrameDownscale: deferInputFrameDownscale,
            maskBlurRadius: maskBlurRadius
        });
        _this = _super.call(this, backgroundProcessorPipeline, options) || this;
        _this._blurFilterRadius = constants_1.BLUR_FILTER_RADIUS;
        // tslint:disable-next-line no-unused-variable
        _this._name = 'GaussianBlurBackgroundProcessor';
        _this.blurFilterRadius = options.blurFilterRadius;
        return _this;
    }
    Object.defineProperty(GaussianBlurBackgroundProcessor.prototype, "blurFilterRadius", {
        /**
         * The current background blur filter radius in pixels.
         */
        get: function () {
            return this._blurFilterRadius;
        },
        /**
         * Set a new background blur filter radius in pixels.
         */
        set: function (radius) {
            if (!radius) {
                console.warn("Valid blur filter radius not found. Using ".concat(constants_1.BLUR_FILTER_RADIUS, " as default."));
                radius = constants_1.BLUR_FILTER_RADIUS;
            }
            this._blurFilterRadius = radius;
            this._backgroundProcessorPipeline
                .setBlurFilterRadius(this._blurFilterRadius)
                .catch(function () {
                /* noop */
            });
        },
        enumerable: false,
        configurable: true
    });
    return GaussianBlurBackgroundProcessor;
}(BackgroundProcessor_1.BackgroundProcessor));
exports.GaussianBlurBackgroundProcessor = GaussianBlurBackgroundProcessor;
//# sourceMappingURL=GaussianBlurBackgroundProcessor.js.map
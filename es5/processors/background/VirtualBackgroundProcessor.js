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
exports.VirtualBackgroundProcessor = void 0;
var types_1 = require("../../types");
var constants_1 = require("../../constants");
var support_1 = require("../../utils/support");
var BackgroundProcessor_1 = require("./BackgroundProcessor");
var backgroundprocessorpipeline_1 = require("./pipelines/backgroundprocessorpipeline");
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
 * let virtualBackground: VirtualBackgroundProcessor;
 * const img = new Image();
 *
 * img.onload = async () => {
 *   virtualBackground = new VirtualBackgroundProcessor({
 *     assetsPath: 'https://my-server-path/assets',
 *     backgroundImage: img
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
 *     inputFrameBufferType: 'videoframe',
 *     outputFrameBufferContextType: 'bitmaprenderer'
 *   });
 * };
 *
 * img.src = '/background.jpg';
 * ```
 */
var VirtualBackgroundProcessor = /** @class */ (function (_super) {
    __extends(VirtualBackgroundProcessor, _super);
    /**
     * Construct a VirtualBackgroundProcessor. Default values will be used for
     * any missing optional properties in [[VirtualBackgroundProcessorOptions]],
     * and invalid properties will be ignored.
     */
    function VirtualBackgroundProcessor(options) {
        var _this = this;
        var backgroundImage = options.backgroundImage, _a = options.deferInputFrameDownscale, deferInputFrameDownscale = _a === void 0 ? false : _a, _b = options.fitType, fitType = _b === void 0 ? types_1.ImageFit.Fill : _b, _c = options.maskBlurRadius, maskBlurRadius = _c === void 0 ? constants_1.MASK_BLUR_RADIUS : _c, _d = options.useWebWorker, useWebWorker = _d === void 0 ? true : _d;
        var assetsPath = options
            .assetsPath
            .replace(/([^/])$/, '$1/');
        var VirtualBackgroundProcessorPipelineOrProxy = useWebWorker && (0, support_1.isChromiumImageBitmap)()
            ? backgroundprocessorpipeline_1.VirtualBackgroundProcessorPipelineProxy
            : backgroundprocessorpipeline_1.VirtualBackgroundProcessorPipeline;
        var backgroundProcessorPipeline = new VirtualBackgroundProcessorPipelineOrProxy({
            assetsPath: assetsPath,
            deferInputFrameDownscale: deferInputFrameDownscale,
            fitType: fitType,
            maskBlurRadius: maskBlurRadius
        });
        _this = _super.call(this, backgroundProcessorPipeline, options) || this;
        // tslint:disable-next-line no-unused-variable
        _this._name = 'VirtualBackgroundProcessor';
        _this.backgroundImage = backgroundImage;
        _this.fitType = fitType;
        return _this;
    }
    Object.defineProperty(VirtualBackgroundProcessor.prototype, "backgroundImage", {
        /**
         * The HTMLImageElement representing the current background image.
         */
        get: function () {
            return this._backgroundImage;
        },
        /**
         * Set an HTMLImageElement as the new background image.
         * An error will be raised if the image hasn't been fully loaded yet. Additionally, the image must follow
         * [security guidelines](https://developer.mozilla.org/en-US/docs/Web/HTML/CORS_enabled_image)
         * when loading the image from a different origin. Failing to do so will result to an empty output frame.
         */
        set: function (image) {
            var _this = this;
            if (!image || !image.complete || !image.naturalHeight) {
                throw new Error('Invalid image. Make sure that the image is an HTMLImageElement and has been successfully loaded');
            }
            this._backgroundImage = image;
            createImageBitmap(this._backgroundImage).then(function (imageBitmap) { return _this._backgroundProcessorPipeline
                .setBackgroundImage(imageBitmap); }).catch(function () {
                /* noop */
            });
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(VirtualBackgroundProcessor.prototype, "fitType", {
        /**
         * The current [[ImageFit]] for positioning of the background image in the viewport.
         */
        get: function () {
            return this._fitType;
        },
        /**
         * Set a new [[ImageFit]] to be used for positioning the background image in the viewport.
         */
        set: function (fitType) {
            var validTypes = Object.keys(types_1.ImageFit);
            if (!validTypes.includes(fitType)) {
                console.warn("Valid fitType not found. Using '".concat(types_1.ImageFit.Fill, "' as default."));
                fitType = types_1.ImageFit.Fill;
            }
            this._fitType = fitType;
            this._backgroundProcessorPipeline
                .setFitType(this._fitType)
                .catch(function () {
                /* noop */
            });
        },
        enumerable: false,
        configurable: true
    });
    return VirtualBackgroundProcessor;
}(BackgroundProcessor_1.BackgroundProcessor));
exports.VirtualBackgroundProcessor = VirtualBackgroundProcessor;
//# sourceMappingURL=VirtualBackgroundProcessor.js.map
/*! twilio-video-processors.js 3.0.0-preview.2

The following license applies to all parts of this software except as
documented below.

    Copyright (C) 2022 Twilio Inc.
    All rights reserved.

    Redistribution and use in source and binary forms, with or without
    modification, are permitted provided that the following conditions are
    met:

      1. Redistributions of source code must retain the above copyright
         notice, this list of conditions and the following disclaimer.

      2. Redistributions in binary form must reproduce the above copyright
         notice, this list of conditions and the following disclaimer in
         the documentation and/or other materials provided with the
         distribution.

      3. Neither the name of Twilio nor the names of its contributors may
         be used to endorse or promote products derived from this software
         without specific prior written permission.

    THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
    "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
    LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
    A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
    HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
    SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
    LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
    DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
    THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
    (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
    OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

*/
(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WASM_INFERENCE_DIMENSIONS = exports.TWILIO_VIRTUAL_BACKGROUND_PROCESSOR_PIPELINE_WORKER = exports.TWILIO_GAUSSIAN_BLUR_BACKGROUND_PROCESSOR_PIPELINE_WORKER = exports.TFLITE_SIMD_LOADER_NAME = exports.TFLITE_LOADER_NAME = exports.MODEL_NAME = exports.MASK_BLUR_RADIUS = exports.BLUR_FILTER_RADIUS = void 0;
exports.BLUR_FILTER_RADIUS = 15;
exports.MASK_BLUR_RADIUS = 8;
exports.MODEL_NAME = 'selfie_segmentation_landscape.tflite';
exports.TFLITE_LOADER_NAME = 'tflite-1-0-0.js';
exports.TFLITE_SIMD_LOADER_NAME = 'tflite-simd-1-0-0.js';
exports.TWILIO_GAUSSIAN_BLUR_BACKGROUND_PROCESSOR_PIPELINE_WORKER = 'twilio-gaussian-blur-background-processor-pipeline-worker.js';
exports.TWILIO_VIRTUAL_BACKGROUND_PROCESSOR_PIPELINE_WORKER = 'twilio-virtual-background-processor-pipeline-worker.js';
exports.WASM_INFERENCE_DIMENSIONS = {
    width: 256,
    height: 144,
};

},{}],2:[function(require,module,exports){
"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VirtualBackgroundProcessor = exports.version = exports.isSupported = exports.ImageFit = exports.GaussianBlurBackgroundProcessor = void 0;
var GaussianBlurBackgroundProcessor_1 = require("./processors/background/GaussianBlurBackgroundProcessor");
Object.defineProperty(exports, "GaussianBlurBackgroundProcessor", { enumerable: true, get: function () { return GaussianBlurBackgroundProcessor_1.GaussianBlurBackgroundProcessor; } });
var VirtualBackgroundProcessor_1 = require("./processors/background/VirtualBackgroundProcessor");
Object.defineProperty(exports, "VirtualBackgroundProcessor", { enumerable: true, get: function () { return VirtualBackgroundProcessor_1.VirtualBackgroundProcessor; } });
var types_1 = require("./types");
Object.defineProperty(exports, "ImageFit", { enumerable: true, get: function () { return types_1.ImageFit; } });
var support_1 = require("./utils/support");
Object.defineProperty(exports, "isSupported", { enumerable: true, get: function () { return support_1.isSupported; } });
var version_1 = require("./utils/version");
Object.defineProperty(exports, "version", { enumerable: true, get: function () { return version_1.version; } });
if (typeof window !== 'undefined') {
    window.Twilio = window.Twilio || {};
    window.Twilio.VideoProcessors = __assign(__assign({}, window.Twilio.VideoProcessors), { GaussianBlurBackgroundProcessor: GaussianBlurBackgroundProcessor_1.GaussianBlurBackgroundProcessor, ImageFit: types_1.ImageFit, isSupported: support_1.isSupported, version: version_1.version, VirtualBackgroundProcessor: VirtualBackgroundProcessor_1.VirtualBackgroundProcessor });
}

},{"./processors/background/GaussianBlurBackgroundProcessor":5,"./processors/background/VirtualBackgroundProcessor":6,"./types":26,"./utils/support":30,"./utils/version":31}],3:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Processor = void 0;
/**
 * @private
 * The [[Processor]] is an abstract class for building your own custom processors.
 */
var Processor = /** @class */ (function () {
    function Processor() {
    }
    return Processor;
}());
exports.Processor = Processor;

},{}],4:[function(require,module,exports){
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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BackgroundProcessor = void 0;
var constants_1 = require("../../constants");
var Processor_1 = require("../Processor");
var backgroundprocessorpipeline_1 = require("./pipelines/backgroundprocessorpipeline");
/**
 * @private
 */
var BackgroundProcessor = /** @class */ (function (_super) {
    __extends(BackgroundProcessor, _super);
    function BackgroundProcessor(backgroundProcessorPipeline, options) {
        var _this = _super.call(this) || this;
        _this._deferInputFrameDownscale = false;
        _this._inputFrameCanvas = new OffscreenCanvas(1, 1);
        _this._inputFrameContext = _this._inputFrameCanvas.getContext('2d', { willReadFrequently: true });
        _this._isSimdEnabled = null;
        _this._maskBlurRadius = constants_1.MASK_BLUR_RADIUS;
        _this._outputFrameBuffer = null;
        _this._outputFrameBufferContext = null;
        var assetsPath = options.assetsPath, _a = options.deferInputFrameDownscale, deferInputFrameDownscale = _a === void 0 ? _this._deferInputFrameDownscale : _a, _b = options.maskBlurRadius, maskBlurRadius = _b === void 0 ? _this._maskBlurRadius : _b;
        if (typeof assetsPath !== 'string') {
            throw new Error('assetsPath parameter must be a string');
        }
        _this._assetsPath = assetsPath.replace(/([^/])$/, '$1/');
        _this._backgroundProcessorPipeline = backgroundProcessorPipeline;
        // @ts-ignore
        _this._benchmark = _this._backgroundProcessorPipeline._benchmark;
        _this.deferInputFrameDownscale = deferInputFrameDownscale;
        _this.maskBlurRadius = maskBlurRadius;
        return _this;
    }
    Object.defineProperty(BackgroundProcessor.prototype, "deferInputFrameDownscale", {
        /**
         * Whether the pipeline is calculating the person mask without
         * waiting for the current input frame to be downscaled (Chrome only).
         */
        get: function () {
            return this._deferInputFrameDownscale;
        },
        /**
         * Toggle whether the pipeline should calculate the person mask
         * without waiting for the current input frame to be downscaled
         * (Chrome only).
         */
        set: function (defer) {
            if (typeof defer !== 'boolean') {
                console.warn('Provided deferInputFrameDownscale is not a boolean.');
                defer = this._deferInputFrameDownscale;
            }
            if (this._deferInputFrameDownscale !== defer) {
                this._deferInputFrameDownscale = defer;
                this._backgroundProcessorPipeline.setDeferInputFrameDownscale(this._deferInputFrameDownscale).catch(function () {
                    /* noop */
                });
            }
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(BackgroundProcessor.prototype, "maskBlurRadius", {
        /**
         * The current blur radius when smoothing out the edges of the person's mask.
         */
        get: function () {
            return this._maskBlurRadius;
        },
        /**
         * Set a new blur radius to be used when smoothing out the edges of the person's mask.
         */
        set: function (radius) {
            if (typeof radius !== 'number' || radius < 0) {
                console.warn("Valid mask blur radius not found. Using ".concat(constants_1.MASK_BLUR_RADIUS, " as default."));
                radius = constants_1.MASK_BLUR_RADIUS;
            }
            if (this._maskBlurRadius !== radius) {
                this._maskBlurRadius = radius;
                this._backgroundProcessorPipeline
                    .setMaskBlurRadius(this._maskBlurRadius)
                    .catch(function () {
                    /* noop */
                });
            }
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Load the segmentation model.
     * Call this method before attaching the processor to ensure
     * video frames are processed correctly.
     */
    BackgroundProcessor.prototype.loadModel = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = this;
                        return [4 /*yield*/, this
                                ._backgroundProcessorPipeline
                                .loadTwilioTFLite()];
                    case 1:
                        _a._isSimdEnabled = _b.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Apply a transform to the background of an input video frame and leaving
     * the foreground (person(s)) untouched. Any exception detected will
     * result in the frame being dropped.
     * @param inputFrameBuffer - The source of the input frame to process.
     * <br/>
     * <br/>
     * [OffscreenCanvas](https://developer.mozilla.org/en-US/docs/Web/API/OffscreenCanvas) - Good for canvas-related processing
     * that can be rendered off screen.
     * <br/>
     * <br/>
     * [HTMLCanvasElement](https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement) - This is recommended on browsers
     * that doesn't support `OffscreenCanvas`, or if you need to render the frame on the screen.
     * <br/>
     * <br/>
     * [HTMLVideoElement](https://developer.mozilla.org/en-US/docs/Web/API/HTMLVideoElement)
     * <br/>
     * <br/>
     * [VideoFrame](https://developer.mozilla.org/en-US/docs/Web/API/VideoFrame) - Recommended on browsers that support the
     * [Insertable Streams API](https://developer.mozilla.org/en-US/docs/Web/API/Insertable_Streams_for_MediaStreamTrack_API).
     * <br/>
     * @param outputFrameBuffer - The output frame buffer to use to draw the processed frame.
     */
    BackgroundProcessor.prototype.processFrame = function (inputFrameBuffer, outputFrameBuffer) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, _backgroundProcessorPipeline, _benchmark, _outputFrameBufferContext, _b, captureWidth, captureHeight, inputFrame, outputFrame, _c, outputBitmap;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        if (!inputFrameBuffer || !outputFrameBuffer) {
                            throw new Error('Missing input or output frame buffer');
                        }
                        _a = this, _backgroundProcessorPipeline = _a._backgroundProcessorPipeline, _benchmark = _a._benchmark, _outputFrameBufferContext = _a._outputFrameBufferContext;
                        _benchmark.end('captureFrameDelay');
                        _benchmark.end('totalProcessingDelay');
                        _benchmark.start('totalProcessingDelay');
                        _benchmark.start('processFrameDelay');
                        _b = inputFrameBuffer instanceof HTMLVideoElement
                            ? { width: inputFrameBuffer.videoWidth, height: inputFrameBuffer.videoHeight }
                            : typeof VideoFrame === 'function' && inputFrameBuffer instanceof VideoFrame
                                ? { width: inputFrameBuffer.displayWidth, height: inputFrameBuffer.displayHeight }
                                : inputFrameBuffer, captureWidth = _b.width, captureHeight = _b.height;
                        if (this._outputFrameBuffer !== outputFrameBuffer) {
                            this._outputFrameBuffer = outputFrameBuffer;
                            this._outputFrameBufferContext = outputFrameBuffer.getContext('2d')
                                || outputFrameBuffer.getContext('bitmaprenderer');
                        }
                        if (this._inputFrameCanvas.width !== captureWidth) {
                            this._inputFrameCanvas.width = captureWidth;
                        }
                        if (this._inputFrameCanvas.height !== captureHeight) {
                            this._inputFrameCanvas.height = captureHeight;
                        }
                        if (inputFrameBuffer instanceof HTMLVideoElement) {
                            this._inputFrameContext.drawImage(inputFrameBuffer, 0, 0);
                            inputFrame = this._inputFrameCanvas;
                        }
                        else {
                            inputFrame = inputFrameBuffer;
                        }
                        if (!(_backgroundProcessorPipeline instanceof backgroundprocessorpipeline_1.BackgroundProcessorPipeline)) return [3 /*break*/, 2];
                        return [4 /*yield*/, _backgroundProcessorPipeline
                                .render(inputFrame)];
                    case 1:
                        _c = _d.sent();
                        return [3 /*break*/, 4];
                    case 2: return [4 /*yield*/, _backgroundProcessorPipeline
                            .render(inputFrame)];
                    case 3:
                        _c = _d.sent();
                        _d.label = 4;
                    case 4:
                        outputFrame = _c;
                        if (_outputFrameBufferContext instanceof ImageBitmapRenderingContext) {
                            outputBitmap = outputFrame instanceof OffscreenCanvas
                                ? outputFrame.transferToImageBitmap()
                                : outputFrame;
                            _outputFrameBufferContext.transferFromImageBitmap(outputBitmap);
                        }
                        else if (_outputFrameBufferContext instanceof CanvasRenderingContext2D && outputFrame) {
                            _outputFrameBufferContext.drawImage(outputFrame, 0, 0);
                        }
                        _benchmark.end('processFrameDelay');
                        _benchmark.start('captureFrameDelay');
                        return [2 /*return*/];
                }
            });
        });
    };
    return BackgroundProcessor;
}(Processor_1.Processor));
exports.BackgroundProcessor = BackgroundProcessor;

},{"../../constants":1,"../Processor":3,"./pipelines/backgroundprocessorpipeline":15}],5:[function(require,module,exports){
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
var support_1 = require("../../utils/support");
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
        var BackgroundProcessorPipelineOrProxy = useWebWorker && (0, support_1.isChromiumImageBitmap)()
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

},{"../../constants":1,"../../utils/support":30,"./BackgroundProcessor":4,"./pipelines/backgroundprocessorpipeline":15}],6:[function(require,module,exports){
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

},{"../../constants":1,"../../types":26,"../../utils/support":30,"./BackgroundProcessor":4,"./pipelines/backgroundprocessorpipeline":15}],7:[function(require,module,exports){
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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BackgroundProcessorPipeline = void 0;
var constants_1 = require("../../../../constants");
var Benchmark_1 = require("../../../../utils/Benchmark");
var support_1 = require("../../../../utils/support");
var TwilioTFLite_1 = require("../../../../utils/TwilioTFLite");
var pipelines_1 = require("../../../pipelines");
var InputFrameDownscaleStage_1 = require("./InputFrameDownscaleStage");
var PostProcessingStage_1 = require("./PostProcessingStage");
/**
 * @private
 */
var BackgroundProcessorPipeline = /** @class */ (function (_super) {
    __extends(BackgroundProcessorPipeline, _super);
    function BackgroundProcessorPipeline(options, onResizeWebGL2Canvas) {
        if (onResizeWebGL2Canvas === void 0) { onResizeWebGL2Canvas = function () { }; }
        var _this = _super.call(this) || this;
        _this._outputCanvas = new OffscreenCanvas(1, 1);
        _this._webgl2Canvas = new OffscreenCanvas(1, 1);
        _this._benchmark = new Benchmark_1.Benchmark();
        _this._inferenceInputCanvas = new OffscreenCanvas(constants_1.WASM_INFERENCE_DIMENSIONS.width, constants_1.WASM_INFERENCE_DIMENSIONS.height);
        _this._inputFrameDownscaleMode = (0, support_1.isChromiumImageBitmap)() ? 'image-bitmap' : 'canvas';
        var assetsPath = options.assetsPath, deferInputFrameDownscale = options.deferInputFrameDownscale, maskBlurRadius = options.maskBlurRadius;
        _this._assetsPath = assetsPath;
        _this._deferInputFrameDownscale = deferInputFrameDownscale;
        _this._onResizeWebGL2Canvas = onResizeWebGL2Canvas;
        _this.addStage(new InputFrameDownscaleStage_1.InputFrameDowscaleStage(_this._inferenceInputCanvas, _this._inputFrameDownscaleMode));
        _this.addStage(new PostProcessingStage_1.PostProcessingStage(constants_1.WASM_INFERENCE_DIMENSIONS, _this._webgl2Canvas, _this._outputCanvas, maskBlurRadius, function (inputFrame) { return _this._setBackground(inputFrame); }));
        return _this;
    }
    BackgroundProcessorPipeline.prototype.loadTwilioTFLite = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _twilioTFLite;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _twilioTFLite = BackgroundProcessorPipeline._twilioTFLite;
                        if (!!_twilioTFLite) return [3 /*break*/, 2];
                        _twilioTFLite = new TwilioTFLite_1.TwilioTFLite();
                        return [4 /*yield*/, _twilioTFLite.initialize(this._assetsPath, constants_1.MODEL_NAME, constants_1.TFLITE_LOADER_NAME, constants_1.TFLITE_SIMD_LOADER_NAME)];
                    case 1:
                        _a.sent();
                        BackgroundProcessorPipeline._twilioTFLite = _twilioTFLite;
                        _a.label = 2;
                    case 2: return [2 /*return*/, _twilioTFLite.isSimdEnabled];
                }
            });
        });
    };
    BackgroundProcessorPipeline.prototype.render = function (inputFrame) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, inputFrameDownscaleStage, postProcessingStage, _b, _benchmark, _deferInputFrameDownscale, _c, inferenceInputHeight, inferenceInputWidth, _outputCanvas, _webgl2Canvas, _twilioTFLite, isInputVideoFrame, _d, height, width, didResizeWebGL2Canvas, downscalePromise, personMask;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        if (!BackgroundProcessorPipeline._twilioTFLite) {
                            return [2 /*return*/, null];
                        }
                        _a = this._stages, inputFrameDownscaleStage = _a[0], postProcessingStage = _a[1];
                        _b = this, _benchmark = _b._benchmark, _deferInputFrameDownscale = _b._deferInputFrameDownscale, _c = _b._inferenceInputCanvas, inferenceInputHeight = _c.height, inferenceInputWidth = _c.width, _outputCanvas = _b._outputCanvas, _webgl2Canvas = _b._webgl2Canvas;
                        _twilioTFLite = BackgroundProcessorPipeline._twilioTFLite;
                        isInputVideoFrame = typeof VideoFrame === 'function'
                            && inputFrame instanceof VideoFrame;
                        _d = isInputVideoFrame
                            ? { height: inputFrame.displayHeight, width: inputFrame.displayWidth }
                            : inputFrame, height = _d.height, width = _d.width;
                        didResizeWebGL2Canvas = false;
                        if (_outputCanvas.width !== width) {
                            _outputCanvas.width = width;
                            _webgl2Canvas.width = width;
                            didResizeWebGL2Canvas = true;
                        }
                        if (_outputCanvas.height !== height) {
                            _outputCanvas.height = height;
                            _webgl2Canvas.height = height;
                            didResizeWebGL2Canvas = true;
                        }
                        if (didResizeWebGL2Canvas) {
                            postProcessingStage.resetPersonMaskUpscalePipeline();
                            this._onResizeWebGL2Canvas();
                        }
                        _benchmark.start('inputImageResizeDelay');
                        downscalePromise = inputFrameDownscaleStage.render(inputFrame)
                            .then(function (downscaledFrameData) {
                            _twilioTFLite.loadInputBuffer(downscaledFrameData);
                        });
                        if (!!_deferInputFrameDownscale) return [3 /*break*/, 2];
                        return [4 /*yield*/, downscalePromise];
                    case 1:
                        _e.sent();
                        _e.label = 2;
                    case 2:
                        _benchmark.end('inputImageResizeDelay');
                        _benchmark.start('segmentationDelay');
                        personMask = new ImageData(_twilioTFLite.runInference(), inferenceInputWidth, inferenceInputHeight);
                        _benchmark.end('segmentationDelay');
                        _benchmark.start('imageCompositionDelay');
                        postProcessingStage.render(inputFrame, personMask);
                        _benchmark.end('imageCompositionDelay');
                        if (typeof VideoFrame === 'function'
                            && inputFrame instanceof VideoFrame) {
                            inputFrame.close();
                        }
                        return [2 /*return*/, this._outputCanvas];
                }
            });
        });
    };
    BackgroundProcessorPipeline.prototype.setDeferInputFrameDownscale = function (defer) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                this._deferInputFrameDownscale = defer;
                return [2 /*return*/];
            });
        });
    };
    BackgroundProcessorPipeline.prototype.setMaskBlurRadius = function (radius) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                this._stages[1]
                    .updateMaskBlurRadius(radius);
                return [2 /*return*/];
            });
        });
    };
    BackgroundProcessorPipeline._twilioTFLite = null;
    return BackgroundProcessorPipeline;
}(pipelines_1.Pipeline));
exports.BackgroundProcessorPipeline = BackgroundProcessorPipeline;

},{"../../../../constants":1,"../../../../utils/Benchmark":27,"../../../../utils/TwilioTFLite":29,"../../../../utils/support":30,"../../../pipelines":21,"./InputFrameDownscaleStage":11,"./PostProcessingStage":12}],8:[function(require,module,exports){
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BackgroundProcessorPipelineProxy = void 0;
var comlink_1 = require("comlink");
var Benchmark_1 = require("../../../../utils/Benchmark");
/**
 * @private
 */
var BackgroundProcessorPipelineProxy = /** @class */ (function () {
    function BackgroundProcessorPipelineProxy(pipelineWorkerPromise) {
        this._benchmark = new Benchmark_1.Benchmark();
        this._pipelineWorkerPromise = pipelineWorkerPromise;
    }
    BackgroundProcessorPipelineProxy.prototype.loadTwilioTFLite = function () {
        return __awaiter(this, void 0, void 0, function () {
            var pipelineWorker;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this._pipelineWorkerPromise];
                    case 1:
                        pipelineWorker = _a.sent();
                        return [2 /*return*/, pipelineWorker.loadTwilioTFLite()];
                }
            });
        });
    };
    BackgroundProcessorPipelineProxy.prototype.render = function (inputFrame) {
        return __awaiter(this, void 0, void 0, function () {
            var pipelineWorker, outputFrame, _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, this._pipelineWorkerPromise];
                    case 1:
                        pipelineWorker = _c.sent();
                        return [4 /*yield*/, pipelineWorker.render((0, comlink_1.transfer)(inputFrame, [inputFrame]))];
                    case 2:
                        outputFrame = _c.sent();
                        // @ts-ignore
                        _b = (_a = this._benchmark).merge;
                        return [4 /*yield*/, pipelineWorker._benchmark];
                    case 3:
                        // @ts-ignore
                        _b.apply(_a, [_c.sent()]);
                        return [2 /*return*/, outputFrame];
                }
            });
        });
    };
    BackgroundProcessorPipelineProxy.prototype.setDeferInputFrameDownscale = function (defer) {
        return __awaiter(this, void 0, void 0, function () {
            var pipelineWorker;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this._pipelineWorkerPromise];
                    case 1:
                        pipelineWorker = _a.sent();
                        return [2 /*return*/, pipelineWorker.setDeferInputFrameDownscale(defer)];
                }
            });
        });
    };
    BackgroundProcessorPipelineProxy.prototype.setMaskBlurRadius = function (radius) {
        return __awaiter(this, void 0, void 0, function () {
            var pipelineWorker;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this._pipelineWorkerPromise];
                    case 1:
                        pipelineWorker = _a.sent();
                        return [2 /*return*/, pipelineWorker.setMaskBlurRadius(radius)];
                }
            });
        });
    };
    return BackgroundProcessorPipelineProxy;
}());
exports.BackgroundProcessorPipelineProxy = BackgroundProcessorPipelineProxy;

},{"../../../../utils/Benchmark":27,"comlink":32}],9:[function(require,module,exports){
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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GaussianBlurBackgroundProcessorPipeline = void 0;
var support_1 = require("../../../../utils/support");
var gaussianblurfilterpipeline_1 = require("../gaussianblurfilterpipeline");
var BackgroundProcessorPipeline_1 = require("./BackgroundProcessorPipeline");
/**
 * @private
 */
var GaussianBlurBackgroundProcessorPipeline = /** @class */ (function (_super) {
    __extends(GaussianBlurBackgroundProcessorPipeline, _super);
    function GaussianBlurBackgroundProcessorPipeline(options) {
        var _this = _super.call(this, options, function () { return _this._resetGaussianBlurFilterPipeline(); }) || this;
        _this._gaussianBlurFilterPipeline = null;
        var blurFilterRadius = options.blurFilterRadius;
        _this._blurFilterRadius = blurFilterRadius;
        return _this;
    }
    GaussianBlurBackgroundProcessorPipeline.prototype.setBlurFilterRadius = function (radius) {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_b) {
                this._blurFilterRadius = radius;
                return [2 /*return*/, (_a = this._gaussianBlurFilterPipeline) === null || _a === void 0 ? void 0 : _a.updateRadius(this._blurFilterRadius)];
            });
        });
    };
    GaussianBlurBackgroundProcessorPipeline.prototype._setBackground = function (inputFrame) {
        var _a = this, _blurFilterRadius = _a._blurFilterRadius, _outputCanvas = _a._outputCanvas, _webgl2Canvas = _a._webgl2Canvas;
        var ctx = _outputCanvas.getContext('2d');
        if (support_1.isCanvasBlurSupported) {
            ctx.filter = "blur(".concat(_blurFilterRadius, "px)");
            ctx.drawImage(inputFrame, 0, 0);
            ctx.filter = 'none';
            return;
        }
        if (!this._gaussianBlurFilterPipeline) {
            this._resetGaussianBlurFilterPipeline();
        }
        this._gaussianBlurFilterPipeline.render();
        ctx.drawImage(_webgl2Canvas, 0, 0);
    };
    GaussianBlurBackgroundProcessorPipeline.prototype._resetGaussianBlurFilterPipeline = function () {
        var _a;
        var _b = this, _blurFilterRadius = _b._blurFilterRadius, _webgl2Canvas = _b._webgl2Canvas;
        (_a = this._gaussianBlurFilterPipeline) === null || _a === void 0 ? void 0 : _a.cleanUp();
        this._gaussianBlurFilterPipeline = new gaussianblurfilterpipeline_1.GaussianBlurFilterPipeline(_webgl2Canvas);
        this._gaussianBlurFilterPipeline.updateRadius(_blurFilterRadius);
    };
    return GaussianBlurBackgroundProcessorPipeline;
}(BackgroundProcessorPipeline_1.BackgroundProcessorPipeline));
exports.GaussianBlurBackgroundProcessorPipeline = GaussianBlurBackgroundProcessorPipeline;

},{"../../../../utils/support":30,"../gaussianblurfilterpipeline":17,"./BackgroundProcessorPipeline":7}],10:[function(require,module,exports){
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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GaussianBlurBackgroundProcessorPipelineProxy = void 0;
var comlink_1 = require("comlink");
var constants_1 = require("../../../../constants");
var CorsWorker_1 = require("../../../../utils/CorsWorker");
var BackgroundProcessorPipeline_proxy_1 = require("./BackgroundProcessorPipeline.proxy");
var GaussianBlurBackgroundProcessorPipelineWorker;
/**
 * @private
 */
var GaussianBlurBackgroundProcessorPipelineProxy = /** @class */ (function (_super) {
    __extends(GaussianBlurBackgroundProcessorPipelineProxy, _super);
    function GaussianBlurBackgroundProcessorPipelineProxy(options) {
        var _this = this;
        var corsWorker = new CorsWorker_1.CorsWorker("".concat(options.assetsPath).concat(constants_1.TWILIO_GAUSSIAN_BLUR_BACKGROUND_PROCESSOR_PIPELINE_WORKER));
        var pipelineWorkerPromise = corsWorker.workerPromise.then(function (worker) {
            GaussianBlurBackgroundProcessorPipelineWorker || (GaussianBlurBackgroundProcessorPipelineWorker = (0, comlink_1.wrap)(worker));
            return new GaussianBlurBackgroundProcessorPipelineWorker(options);
        });
        _this = _super.call(this, pipelineWorkerPromise) || this;
        _this._pipelineWorkerPromise = pipelineWorkerPromise;
        return _this;
    }
    GaussianBlurBackgroundProcessorPipelineProxy.prototype.setBlurFilterRadius = function (radius) {
        return __awaiter(this, void 0, void 0, function () {
            var pipelineWorker;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this._pipelineWorkerPromise];
                    case 1:
                        pipelineWorker = _a.sent();
                        return [2 /*return*/, pipelineWorker.setBlurFilterRadius(radius)];
                }
            });
        });
    };
    return GaussianBlurBackgroundProcessorPipelineProxy;
}(BackgroundProcessorPipeline_proxy_1.BackgroundProcessorPipelineProxy));
exports.GaussianBlurBackgroundProcessorPipelineProxy = GaussianBlurBackgroundProcessorPipelineProxy;

},{"../../../../constants":1,"../../../../utils/CorsWorker":28,"./BackgroundProcessorPipeline.proxy":8,"comlink":32}],11:[function(require,module,exports){
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InputFrameDowscaleStage = void 0;
/**
 * @private
 */
var InputFrameDowscaleStage = /** @class */ (function () {
    function InputFrameDowscaleStage(outputCanvas, inputFrameDownscaleMode) {
        this._inputFrameDownscaleMode = inputFrameDownscaleMode;
        this._outputContext = outputCanvas.getContext('2d', { willReadFrequently: true });
    }
    InputFrameDowscaleStage.prototype.render = function (inputFrame) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, _outputContext, _inputFrameDownscaleMode, _b, resizeHeight, resizeWidth, downscaledBitmap, data;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _a = this, _outputContext = _a._outputContext, _inputFrameDownscaleMode = _a._inputFrameDownscaleMode;
                        _b = _outputContext.canvas, resizeHeight = _b.height, resizeWidth = _b.width;
                        if (!(_inputFrameDownscaleMode === 'image-bitmap')) return [3 /*break*/, 2];
                        return [4 /*yield*/, createImageBitmap(inputFrame, {
                                resizeWidth: resizeWidth,
                                resizeHeight: resizeHeight,
                                resizeQuality: 'pixelated'
                            })];
                    case 1:
                        downscaledBitmap = _c.sent();
                        _outputContext.drawImage(downscaledBitmap, 0, 0);
                        downscaledBitmap.close();
                        return [3 /*break*/, 3];
                    case 2:
                        _outputContext.drawImage(inputFrame, 0, 0, resizeWidth, resizeHeight);
                        _c.label = 3;
                    case 3:
                        data = _outputContext.getImageData(0, 0, resizeWidth, resizeHeight).data;
                        return [2 /*return*/, data];
                }
            });
        });
    };
    return InputFrameDowscaleStage;
}());
exports.InputFrameDowscaleStage = InputFrameDowscaleStage;

},{}],12:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostProcessingStage = void 0;
var personmaskupscalepipeline_1 = require("../personmaskupscalepipeline");
/**
 * @private
 */
var PostProcessingStage = /** @class */ (function () {
    function PostProcessingStage(inputDimensions, webgl2Canvas, outputCanvas, maskBlurRadius, setBackground) {
        this._personMaskUpscalePipeline = null;
        this._inputDimensions = inputDimensions;
        this._maskBlurRadius = maskBlurRadius;
        this._outputContext = outputCanvas.getContext('2d');
        this._webgl2Canvas = webgl2Canvas;
        this._setBackground = setBackground;
    }
    PostProcessingStage.prototype.render = function (inputFrame, personMask) {
        var _a = this, _outputContext = _a._outputContext, _setBackground = _a._setBackground, _webgl2Canvas = _a._webgl2Canvas;
        if (!this._personMaskUpscalePipeline) {
            this.resetPersonMaskUpscalePipeline();
        }
        this._personMaskUpscalePipeline.render(inputFrame, personMask);
        _outputContext.save();
        _outputContext.globalCompositeOperation = 'copy';
        _outputContext.drawImage(_webgl2Canvas, 0, 0);
        _outputContext.globalCompositeOperation = 'destination-over';
        _setBackground(inputFrame);
        _outputContext.restore();
    };
    PostProcessingStage.prototype.resetPersonMaskUpscalePipeline = function () {
        var _a;
        var _b = this, _inputDimensions = _b._inputDimensions, _maskBlurRadius = _b._maskBlurRadius, _webgl2Canvas = _b._webgl2Canvas;
        (_a = this._personMaskUpscalePipeline) === null || _a === void 0 ? void 0 : _a.cleanUp();
        this._personMaskUpscalePipeline = new personmaskupscalepipeline_1.PersonMaskUpscalePipeline(_inputDimensions, _webgl2Canvas);
        this._personMaskUpscalePipeline.updateBilateralFilterConfig({
            sigmaSpace: _maskBlurRadius
        });
    };
    PostProcessingStage.prototype.updateMaskBlurRadius = function (radius) {
        var _a;
        if (this._maskBlurRadius !== radius) {
            this._maskBlurRadius = radius;
            (_a = this._personMaskUpscalePipeline) === null || _a === void 0 ? void 0 : _a.updateBilateralFilterConfig({
                sigmaSpace: radius
            });
        }
    };
    return PostProcessingStage;
}());
exports.PostProcessingStage = PostProcessingStage;

},{"../personmaskupscalepipeline":19}],13:[function(require,module,exports){
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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VirtualBackgroundProcessorPipeline = void 0;
var types_1 = require("../../../../types");
var BackgroundProcessorPipeline_1 = require("./BackgroundProcessorPipeline");
/**
 * @private
 */
var VirtualBackgroundProcessorPipeline = /** @class */ (function (_super) {
    __extends(VirtualBackgroundProcessorPipeline, _super);
    function VirtualBackgroundProcessorPipeline(options) {
        var _this = _super.call(this, options) || this;
        var fitType = options.fitType;
        _this._backgroundImage = null;
        _this._fitType = fitType;
        return _this;
    }
    VirtualBackgroundProcessorPipeline.prototype.setBackgroundImage = function (backgroundImage) {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_b) {
                (_a = this._backgroundImage) === null || _a === void 0 ? void 0 : _a.close();
                this._backgroundImage = backgroundImage;
                return [2 /*return*/];
            });
        });
    };
    VirtualBackgroundProcessorPipeline.prototype.setFitType = function (fitType) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                this._fitType = fitType;
                return [2 /*return*/];
            });
        });
    };
    VirtualBackgroundProcessorPipeline.prototype._setBackground = function () {
        var _a = this, _backgroundImage = _a._backgroundImage, _fitType = _a._fitType, _outputCanvas = _a._outputCanvas;
        if (!_backgroundImage) {
            return;
        }
        var ctx = _outputCanvas.getContext('2d');
        var imageWidth = _backgroundImage.width;
        var imageHeight = _backgroundImage.height;
        var canvasWidth = _outputCanvas.width;
        var canvasHeight = _outputCanvas.height;
        if (_fitType === types_1.ImageFit.Fill) {
            ctx.drawImage(_backgroundImage, 0, 0, imageWidth, imageHeight, 0, 0, canvasWidth, canvasHeight);
        }
        else if (_fitType === types_1.ImageFit.None) {
            ctx.drawImage(_backgroundImage, 0, 0, imageWidth, imageHeight);
        }
        else {
            var _b = this._getFitPosition(imageWidth, imageHeight, canvasWidth, canvasHeight, _fitType), x = _b.x, y = _b.y, w = _b.w, h = _b.h;
            ctx.drawImage(_backgroundImage, 0, 0, imageWidth, imageHeight, x, y, w, h);
        }
    };
    VirtualBackgroundProcessorPipeline.prototype._getFitPosition = function (contentWidth, contentHeight, viewportWidth, viewportHeight, type) {
        // Calculate new content width to fit viewport width
        var factor = viewportWidth / contentWidth;
        var newContentWidth = viewportWidth;
        var newContentHeight = factor * contentHeight;
        // Scale down the resulting height and width more
        // to fit viewport height if the content still exceeds it
        if ((type === types_1.ImageFit.Contain && newContentHeight > viewportHeight)
            || (type === types_1.ImageFit.Cover && viewportHeight > newContentHeight)) {
            factor = viewportHeight / newContentHeight;
            newContentWidth = factor * newContentWidth;
            newContentHeight = viewportHeight;
        }
        // Calculate the destination top left corner to center the content
        var x = (viewportWidth - newContentWidth) / 2;
        var y = (viewportHeight - newContentHeight) / 2;
        return {
            x: x,
            y: y,
            w: newContentWidth,
            h: newContentHeight,
        };
    };
    return VirtualBackgroundProcessorPipeline;
}(BackgroundProcessorPipeline_1.BackgroundProcessorPipeline));
exports.VirtualBackgroundProcessorPipeline = VirtualBackgroundProcessorPipeline;

},{"../../../../types":26,"./BackgroundProcessorPipeline":7}],14:[function(require,module,exports){
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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VirtualBackgroundProcessorPipelineProxy = void 0;
var comlink_1 = require("comlink");
var constants_1 = require("../../../../constants");
var CorsWorker_1 = require("../../../../utils/CorsWorker");
var BackgroundProcessorPipeline_proxy_1 = require("./BackgroundProcessorPipeline.proxy");
var VirtualBackgroundProcessorPipelineWorker;
/**
 * @private
 */
var VirtualBackgroundProcessorPipelineProxy = /** @class */ (function (_super) {
    __extends(VirtualBackgroundProcessorPipelineProxy, _super);
    function VirtualBackgroundProcessorPipelineProxy(options) {
        var _this = this;
        var corsWorker = new CorsWorker_1.CorsWorker("".concat(options.assetsPath).concat(constants_1.TWILIO_VIRTUAL_BACKGROUND_PROCESSOR_PIPELINE_WORKER));
        var pipelineWorkerPromise = corsWorker.workerPromise.then(function (worker) {
            VirtualBackgroundProcessorPipelineWorker || (VirtualBackgroundProcessorPipelineWorker = (0, comlink_1.wrap)(worker));
            return new VirtualBackgroundProcessorPipelineWorker(options);
        });
        _this = _super.call(this, pipelineWorkerPromise) || this;
        _this._pipelineWorkerPromise = pipelineWorkerPromise;
        return _this;
    }
    VirtualBackgroundProcessorPipelineProxy.prototype.setBackgroundImage = function (backgroundImage) {
        return __awaiter(this, void 0, void 0, function () {
            var pipelineWorker;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this._pipelineWorkerPromise];
                    case 1:
                        pipelineWorker = _a.sent();
                        return [2 /*return*/, pipelineWorker.setBackgroundImage((0, comlink_1.transfer)(backgroundImage, [backgroundImage]))];
                }
            });
        });
    };
    VirtualBackgroundProcessorPipelineProxy.prototype.setFitType = function (fitType) {
        return __awaiter(this, void 0, void 0, function () {
            var pipelineWorker;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this._pipelineWorkerPromise];
                    case 1:
                        pipelineWorker = _a.sent();
                        return [2 /*return*/, pipelineWorker.setFitType(fitType)];
                }
            });
        });
    };
    return VirtualBackgroundProcessorPipelineProxy;
}(BackgroundProcessorPipeline_proxy_1.BackgroundProcessorPipelineProxy));
exports.VirtualBackgroundProcessorPipelineProxy = VirtualBackgroundProcessorPipelineProxy;

},{"../../../../constants":1,"../../../../utils/CorsWorker":28,"./BackgroundProcessorPipeline.proxy":8,"comlink":32}],15:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VirtualBackgroundProcessorPipelineProxy = exports.VirtualBackgroundProcessorPipeline = exports.GaussianBlurBackgroundProcessorPipelineProxy = exports.GaussianBlurBackgroundProcessorPipeline = exports.BackgroundProcessorPipelineProxy = exports.BackgroundProcessorPipeline = void 0;
var BackgroundProcessorPipeline_1 = require("./BackgroundProcessorPipeline");
Object.defineProperty(exports, "BackgroundProcessorPipeline", { enumerable: true, get: function () { return BackgroundProcessorPipeline_1.BackgroundProcessorPipeline; } });
var BackgroundProcessorPipeline_proxy_1 = require("./BackgroundProcessorPipeline.proxy");
Object.defineProperty(exports, "BackgroundProcessorPipelineProxy", { enumerable: true, get: function () { return BackgroundProcessorPipeline_proxy_1.BackgroundProcessorPipelineProxy; } });
var GaussianBlurBackgroundProcessorPipeline_1 = require("./GaussianBlurBackgroundProcessorPipeline");
Object.defineProperty(exports, "GaussianBlurBackgroundProcessorPipeline", { enumerable: true, get: function () { return GaussianBlurBackgroundProcessorPipeline_1.GaussianBlurBackgroundProcessorPipeline; } });
var GaussianBlurBackgroundProcessorPipeline_proxy_1 = require("./GaussianBlurBackgroundProcessorPipeline.proxy");
Object.defineProperty(exports, "GaussianBlurBackgroundProcessorPipelineProxy", { enumerable: true, get: function () { return GaussianBlurBackgroundProcessorPipeline_proxy_1.GaussianBlurBackgroundProcessorPipelineProxy; } });
var VirtualBackgroundProcessorPipeline_1 = require("./VirtualBackgroundProcessorPipeline");
Object.defineProperty(exports, "VirtualBackgroundProcessorPipeline", { enumerable: true, get: function () { return VirtualBackgroundProcessorPipeline_1.VirtualBackgroundProcessorPipeline; } });
var VirtualBackgroundProcessorPipeline_proxy_1 = require("./VirtualBackgroundProcessorPipeline.proxy");
Object.defineProperty(exports, "VirtualBackgroundProcessorPipelineProxy", { enumerable: true, get: function () { return VirtualBackgroundProcessorPipeline_proxy_1.VirtualBackgroundProcessorPipelineProxy; } });

},{"./BackgroundProcessorPipeline":7,"./BackgroundProcessorPipeline.proxy":8,"./GaussianBlurBackgroundProcessorPipeline":9,"./GaussianBlurBackgroundProcessorPipeline.proxy":10,"./VirtualBackgroundProcessorPipeline":13,"./VirtualBackgroundProcessorPipeline.proxy":14}],16:[function(require,module,exports){
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
exports.SinglePassGaussianBlurFilterStage = void 0;
var pipelines_1 = require("../../../pipelines");
/**
 * @private
 */
function createGaussianBlurWeights(radius) {
    var coeff = 1.0 / Math.sqrt(2.0 * Math.PI) / radius;
    return '0'.repeat(radius + 1).split('').map(function (zero, x) {
        return coeff * Math.exp(-0.5 * x * x / radius / radius);
    });
}
/**
 * @private
 */
var SinglePassGaussianBlurFilterStage = /** @class */ (function (_super) {
    __extends(SinglePassGaussianBlurFilterStage, _super);
    function SinglePassGaussianBlurFilterStage(glOut, direction, outputType, inputTextureUnit, outputTextureUnit) {
        var _this = this;
        if (outputTextureUnit === void 0) { outputTextureUnit = inputTextureUnit + 1; }
        var _a = glOut.canvas, height = _a.height, width = _a.width;
        _this = _super.call(this, {
            textureName: 'u_inputTexture',
            textureUnit: inputTextureUnit
        }, {
            fragmentShaderSource: "#version 300 es\n          precision highp float;\n\n          uniform sampler2D u_inputTexture;\n          uniform vec2 u_texelSize;\n          uniform float u_direction;\n          uniform float u_radius;\n          uniform float u_gaussianBlurWeights[128];\n\n          in vec2 v_texCoord;\n\n          out vec4 outColor;\n\n          void main() {\n            float totalWeight = u_gaussianBlurWeights[0];\n            vec3 newColor = totalWeight * texture(u_inputTexture, v_texCoord).rgb;\n\n            for (float i = 1.0; i <= u_radius; i += 1.0) {\n              float x = (1.0 - u_direction) * i;\n              float y = u_direction * i;\n\n              vec2 shift = vec2(x, y) * u_texelSize;\n              vec2 coord = vec2(v_texCoord + shift);\n              float weight = u_gaussianBlurWeights[int(i)];\n              newColor += weight * texture(u_inputTexture, coord).rgb;\n              totalWeight += weight;\n\n              shift = vec2(-x, -y) * u_texelSize;\n              coord = vec2(v_texCoord + shift);\n              newColor += weight * texture(u_inputTexture, coord).rgb;\n              totalWeight += weight;\n            }\n\n            newColor /= totalWeight;\n            outColor = vec4(newColor, 1.0);\n          }\n        ",
            glOut: glOut,
            height: height,
            textureUnit: outputTextureUnit,
            type: outputType,
            width: width,
            uniformVars: [
                {
                    name: 'u_direction',
                    type: 'float',
                    values: [direction === 'vertical' ? 1 : 0]
                },
                {
                    name: 'u_texelSize',
                    type: 'float',
                    values: [1 / width, 1 / height]
                }
            ]
        }) || this;
        _this.updateRadius(0);
        return _this;
    }
    SinglePassGaussianBlurFilterStage.prototype.updateRadius = function (radius) {
        this._setUniformVars([
            {
                name: 'u_radius',
                type: 'float',
                values: [radius]
            },
            {
                name: 'u_gaussianBlurWeights',
                type: 'float:v',
                values: createGaussianBlurWeights(radius)
            }
        ]);
    };
    return SinglePassGaussianBlurFilterStage;
}(pipelines_1.WebGL2Pipeline.ProcessingStage));
exports.SinglePassGaussianBlurFilterStage = SinglePassGaussianBlurFilterStage;

},{"../../../pipelines":21}],17:[function(require,module,exports){
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
exports.GaussianBlurFilterPipeline = void 0;
var pipelines_1 = require("../../../pipelines");
var SinglePassGaussianBlurFilterStage_1 = require("./SinglePassGaussianBlurFilterStage");
/**
 * @private
 */
var GaussianBlurFilterPipeline = /** @class */ (function (_super) {
    __extends(GaussianBlurFilterPipeline, _super);
    function GaussianBlurFilterPipeline(outputCanvas) {
        var _this = _super.call(this) || this;
        var glOut = outputCanvas.getContext('webgl2');
        _this.addStage(new SinglePassGaussianBlurFilterStage_1.SinglePassGaussianBlurFilterStage(glOut, 'horizontal', 'texture', 0, 2));
        _this.addStage(new SinglePassGaussianBlurFilterStage_1.SinglePassGaussianBlurFilterStage(glOut, 'vertical', 'canvas', 2));
        return _this;
    }
    GaussianBlurFilterPipeline.prototype.updateRadius = function (radius) {
        this._stages.forEach(function (stage) { return stage
            .updateRadius(radius); });
    };
    return GaussianBlurFilterPipeline;
}(pipelines_1.WebGL2Pipeline));
exports.GaussianBlurFilterPipeline = GaussianBlurFilterPipeline;

},{"../../../pipelines":21,"./SinglePassGaussianBlurFilterStage":16}],18:[function(require,module,exports){
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
exports.SinglePassBilateralFilterStage = void 0;
var pipelines_1 = require("../../../pipelines");
/**
 * @private
 */
function createSpaceWeights(radius, sigma, texelSize) {
    return '0'.repeat(radius).split('').map(function (zero, i) {
        var x = (i + 1) * texelSize;
        return Math.exp(-0.5 * x * x / sigma / sigma);
    });
}
/**
 * @private
 */
function createColorWeights(sigma) {
    return '0'.repeat(256).split('').map(function (zero, i) {
        var x = i / 255;
        return Math.exp(-0.5 * x * x / sigma / sigma);
    });
}
/**
 * @private
 */
var SinglePassBilateralFilterStage = /** @class */ (function (_super) {
    __extends(SinglePassBilateralFilterStage, _super);
    function SinglePassBilateralFilterStage(glOut, direction, outputType, inputDimensions, outputDimensions, inputTextureUnit, outputTextureUnit) {
        var _this = this;
        if (outputTextureUnit === void 0) { outputTextureUnit = inputTextureUnit + 1; }
        var height = outputDimensions.height, width = outputDimensions.width;
        _this = _super.call(this, {
            textureName: 'u_segmentationMask',
            textureUnit: inputTextureUnit
        }, {
            fragmentShaderSource: "#version 300 es\n          precision highp float;\n\n          uniform sampler2D u_inputFrame;\n          uniform sampler2D u_segmentationMask;\n          uniform vec2 u_texelSize;\n          uniform float u_direction;\n          uniform float u_radius;\n          uniform float u_step;\n          uniform float u_spaceWeights[128];\n          uniform float u_colorWeights[256];\n\n          in vec2 v_texCoord;\n\n          out vec4 outColor;\n\n          float calculateColorWeight(vec2 coord, vec3 centerColor) {\n            vec3 coordColor = texture(u_inputFrame, coord).rgb;\n            float x = distance(centerColor, coordColor);\n            return u_colorWeights[int(x * 255.0)];\n          }\n\n          float edgePixelsAverageAlpha(float outAlpha) {\n            float totalAlpha = outAlpha;\n            float totalPixels = 1.0;\n\n            for (float i = -u_radius; u_radius > 0.0 && i <= u_radius; i += u_radius) {\n              for (float j = -u_radius; j <= u_radius; j += u_radius * (j == 0.0 ? 2.0 : 1.0)) {\n                vec2 shift = vec2(i, j) * u_texelSize;\n                vec2 coord = vec2(v_texCoord + shift);\n                totalAlpha += texture(u_segmentationMask, coord).a;\n                totalPixels++;\n              }\n            }\n\n            return totalAlpha / totalPixels;\n          }\n\n          void main() {\n            vec3 centerColor = texture(u_inputFrame, v_texCoord).rgb;\n            float outAlpha = texture(u_segmentationMask, v_texCoord).a;\n            float averageAlpha = edgePixelsAverageAlpha(outAlpha);\n            float totalWeight = 1.0;\n\n            if (averageAlpha == 0.0 || averageAlpha == 1.0) {\n              outColor = vec4(averageAlpha * centerColor, averageAlpha);\n              return;\n            }\n\n            for (float i = 1.0; i <= u_radius; i += u_step) {\n              float x = (1.0 - u_direction) * i;\n              float y = u_direction * i;\n              vec2 shift = vec2(x, y) * u_texelSize;\n              vec2 coord = vec2(v_texCoord + shift);\n              float spaceWeight = u_spaceWeights[int(i - 1.0)];\n              float colorWeight = calculateColorWeight(coord, centerColor);\n              float weight = spaceWeight * colorWeight;\n              float alpha = texture(u_segmentationMask, coord).a;\n              totalWeight += weight;\n              outAlpha += weight * alpha;\n\n              shift = vec2(-x, -y) * u_texelSize;\n              coord = vec2(v_texCoord + shift);\n              colorWeight = calculateColorWeight(coord, centerColor);\n              weight = spaceWeight * colorWeight;\n              alpha = texture(u_segmentationMask, coord).a;\n              totalWeight += weight;\n              outAlpha += weight * alpha;\n            }\n\n            outAlpha /= totalWeight;\n            outColor = vec4(outAlpha * centerColor, outAlpha);\n          }\n        ",
            glOut: glOut,
            height: height,
            textureUnit: outputTextureUnit,
            type: outputType,
            width: width,
            uniformVars: [
                {
                    name: 'u_inputFrame',
                    type: 'int',
                    values: [0]
                },
                {
                    name: 'u_direction',
                    type: 'float',
                    values: [direction === 'vertical' ? 1 : 0]
                },
                {
                    name: 'u_texelSize',
                    type: 'float',
                    values: [1 / width, 1 / height]
                }
            ]
        }) || this;
        _this._direction = direction;
        _this._inputDimensions = inputDimensions;
        _this.updateSigmaColor(0);
        _this.updateSigmaSpace(0);
        return _this;
    }
    SinglePassBilateralFilterStage.prototype.updateSigmaColor = function (sigmaColor) {
        this._setUniformVars([
            {
                name: 'u_colorWeights',
                type: 'float:v',
                values: createColorWeights(sigmaColor)
            }
        ]);
    };
    SinglePassBilateralFilterStage.prototype.updateSigmaSpace = function (sigmaSpace) {
        var _a = this._inputDimensions, inputHeight = _a.height, inputWidth = _a.width;
        var _b = this._outputDimensions, outputHeight = _b.height, outputWidth = _b.width;
        sigmaSpace *= Math.max(outputWidth / inputWidth, outputHeight / inputHeight);
        var step = Math.floor(0.5 * sigmaSpace / Math.log(sigmaSpace));
        var sigmaTexel = Math.max(1 / outputWidth, 1 / outputHeight) * sigmaSpace;
        var texelSize = 1 / (this._direction === 'horizontal'
            ? outputWidth
            : outputHeight);
        this._setUniformVars([
            {
                name: 'u_radius',
                type: 'float',
                values: [sigmaSpace]
            },
            {
                name: 'u_spaceWeights',
                type: 'float:v',
                values: createSpaceWeights(sigmaSpace, sigmaTexel, texelSize)
            },
            {
                name: 'u_step',
                type: 'float',
                values: [step]
            }
        ]);
    };
    return SinglePassBilateralFilterStage;
}(pipelines_1.WebGL2Pipeline.ProcessingStage));
exports.SinglePassBilateralFilterStage = SinglePassBilateralFilterStage;

},{"../../../pipelines":21}],19:[function(require,module,exports){
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
exports.PersonMaskUpscalePipeline = void 0;
var pipelines_1 = require("../../../pipelines");
var SinglePassBilateralFilterStage_1 = require("./SinglePassBilateralFilterStage");
/**
 * @private
 */
var PersonMaskUpscalePipeline = /** @class */ (function (_super) {
    __extends(PersonMaskUpscalePipeline, _super);
    function PersonMaskUpscalePipeline(inputDimensions, outputCanvas) {
        var _this = _super.call(this) || this;
        var glOut = outputCanvas.getContext('webgl2');
        var outputDimensions = {
            height: outputCanvas.height,
            width: outputCanvas.width
        };
        _this.addStage(new pipelines_1.WebGL2Pipeline.InputStage(glOut));
        _this.addStage(new SinglePassBilateralFilterStage_1.SinglePassBilateralFilterStage(glOut, 'horizontal', 'texture', inputDimensions, outputDimensions, 1, 2));
        _this.addStage(new SinglePassBilateralFilterStage_1.SinglePassBilateralFilterStage(glOut, 'vertical', 'canvas', inputDimensions, outputDimensions, 2));
        return _this;
    }
    PersonMaskUpscalePipeline.prototype.updateBilateralFilterConfig = function (config) {
        var _a = this._stages, bilateralFilterStages = _a.slice(1);
        var sigmaSpace = config.sigmaSpace;
        if (typeof sigmaSpace === 'number') {
            bilateralFilterStages.forEach(function (stage) {
                stage.updateSigmaColor(0.1);
                stage.updateSigmaSpace(sigmaSpace);
            });
        }
    };
    return PersonMaskUpscalePipeline;
}(pipelines_1.WebGL2Pipeline));
exports.PersonMaskUpscalePipeline = PersonMaskUpscalePipeline;

},{"../../../pipelines":21,"./SinglePassBilateralFilterStage":18}],20:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Pipeline = void 0;
/**
 * @private
 */
var Pipeline = /** @class */ (function () {
    function Pipeline() {
        this._stages = [];
    }
    Pipeline.prototype.addStage = function (stage) {
        this._stages.push(stage);
    };
    Pipeline.prototype.render = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        this._stages.forEach(function (stage) {
            stage.render.apply(stage, args);
        });
    };
    return Pipeline;
}());
exports.Pipeline = Pipeline;

},{}],21:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebGL2Pipeline = exports.Pipeline = void 0;
var Pipeline_1 = require("./Pipeline");
Object.defineProperty(exports, "Pipeline", { enumerable: true, get: function () { return Pipeline_1.Pipeline; } });
var webgl2pipeline_1 = require("./webgl2pipeline");
Object.defineProperty(exports, "WebGL2Pipeline", { enumerable: true, get: function () { return webgl2pipeline_1.WebGL2Pipeline; } });

},{"./Pipeline":20,"./webgl2pipeline":24}],22:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebGL2PipelineInputStage = void 0;
var webgl2PipelineHelpers_1 = require("./webgl2PipelineHelpers");
/**
 * @private
 */
var WebGL2PipelineInputStage = /** @class */ (function () {
    function WebGL2PipelineInputStage(glOut) {
        this._inputTexture = null;
        var _a = glOut.canvas, height = _a.height, width = _a.width;
        this._glOut = glOut;
        this._inputFrameTexture = (0, webgl2PipelineHelpers_1.createTexture)(glOut, glOut.RGBA8, width, height, glOut.NEAREST, glOut.NEAREST);
    }
    WebGL2PipelineInputStage.prototype.cleanUp = function () {
        var _a = this, _glOut = _a._glOut, _inputFrameTexture = _a._inputFrameTexture, _inputTexture = _a._inputTexture;
        _glOut.deleteTexture(_inputFrameTexture);
        _glOut.deleteTexture(_inputTexture);
    };
    WebGL2PipelineInputStage.prototype.render = function (inputFrame, inputTextureData) {
        var _a = this, _glOut = _a._glOut, _inputFrameTexture = _a._inputFrameTexture;
        var _b = _glOut.canvas, height = _b.height, width = _b.width;
        _glOut.viewport(0, 0, width, height);
        _glOut.clearColor(0, 0, 0, 0);
        _glOut.clear(_glOut.COLOR_BUFFER_BIT);
        if (inputFrame) {
            _glOut.activeTexture(_glOut.TEXTURE0);
            _glOut.bindTexture(_glOut.TEXTURE_2D, _inputFrameTexture);
            _glOut.texSubImage2D(_glOut.TEXTURE_2D, 0, 0, 0, width, height, _glOut.RGBA, _glOut.UNSIGNED_BYTE, inputFrame);
        }
        if (!inputTextureData) {
            return;
        }
        var data = inputTextureData.data, textureHeight = inputTextureData.height, textureWidth = inputTextureData.width;
        if (!this._inputTexture) {
            this._inputTexture = (0, webgl2PipelineHelpers_1.createTexture)(_glOut, _glOut.RGBA8, textureWidth, textureHeight, _glOut.NEAREST, _glOut.NEAREST);
        }
        _glOut.viewport(0, 0, textureWidth, textureHeight);
        _glOut.activeTexture(_glOut.TEXTURE1);
        _glOut.bindTexture(_glOut.TEXTURE_2D, this._inputTexture);
        _glOut.texSubImage2D(_glOut.TEXTURE_2D, 0, 0, 0, textureWidth, textureHeight, _glOut.RGBA, _glOut.UNSIGNED_BYTE, data);
    };
    return WebGL2PipelineInputStage;
}());
exports.WebGL2PipelineInputStage = WebGL2PipelineInputStage;

},{"./webgl2PipelineHelpers":25}],23:[function(require,module,exports){
"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebGL2PipelineProcessingStage = void 0;
var webgl2PipelineHelpers_1 = require("./webgl2PipelineHelpers");
/**;
 * @private
 */
var WebGL2PipelineProcessingStage = /** @class */ (function () {
    function WebGL2PipelineProcessingStage(inputConfig, outputConfig) {
        this._outputFramebuffer = null;
        this._outputTexture = null;
        var textureName = inputConfig.textureName, textureUnit = inputConfig.textureUnit;
        var glOut = outputConfig.glOut;
        this._glOut = glOut;
        var fragmentShaderSource = outputConfig.fragmentShaderSource, _a = outputConfig.height, height = _a === void 0 ? glOut.canvas.height : _a, _b = outputConfig.textureUnit, outputTextureUnit = _b === void 0 ? textureUnit + 1 : _b, outputType = outputConfig.type, _c = outputConfig.uniformVars, uniformVars = _c === void 0 ? [] : _c, _d = outputConfig.vertexShaderSource, vertexShaderSource = _d === void 0 ? "#version 300 es\n        in vec2 a_position;\n        in vec2 a_texCoord;\n\n        out vec2 v_texCoord;\n\n        void main() {\n          gl_Position = vec4(a_position".concat(outputType === 'canvas'
            ? ' * vec2(1.0, -1.0)'
            : '', ", 0.0, 1.0);\n          v_texCoord = a_texCoord;\n        }\n      ") : _d, _e = outputConfig.width, width = _e === void 0 ? glOut.canvas.width : _e;
        this._outputDimensions = {
            height: height,
            width: width
        };
        this._outputTextureUnit = outputTextureUnit;
        this._fragmentShader = (0, webgl2PipelineHelpers_1.compileShader)(glOut, glOut.FRAGMENT_SHADER, fragmentShaderSource);
        this._vertexShader = (0, webgl2PipelineHelpers_1.compileShader)(glOut, glOut.VERTEX_SHADER, vertexShaderSource);
        this._positionBuffer = (0, webgl2PipelineHelpers_1.initBuffer)(glOut, [
            -1.0, -1.0,
            1.0, -1.0,
            -1.0, 1.0,
            1.0, 1.0,
        ]);
        this._texCoordBuffer = (0, webgl2PipelineHelpers_1.initBuffer)(glOut, [
            0.0, 0.0,
            1.0, 0.0,
            0.0, 1.0,
            1.0, 1.0,
        ]);
        if (outputType === 'texture') {
            this._outputTexture = (0, webgl2PipelineHelpers_1.createTexture)(glOut, glOut.RGBA8, width, height);
            this._outputFramebuffer = glOut.createFramebuffer();
            glOut.bindFramebuffer(glOut.FRAMEBUFFER, this._outputFramebuffer);
            glOut.framebufferTexture2D(glOut.FRAMEBUFFER, glOut.COLOR_ATTACHMENT0, glOut.TEXTURE_2D, this._outputTexture, 0);
        }
        var program = (0, webgl2PipelineHelpers_1.createPipelineStageProgram)(glOut, this._vertexShader, this._fragmentShader, this._positionBuffer, this._texCoordBuffer);
        this._program = program;
        this._setUniformVars(__spreadArray([
            {
                name: textureName,
                type: 'int',
                values: [textureUnit]
            }
        ], uniformVars, true));
    }
    WebGL2PipelineProcessingStage.prototype.cleanUp = function () {
        var _a = this, _fragmentShader = _a._fragmentShader, _glOut = _a._glOut, _positionBuffer = _a._positionBuffer, _program = _a._program, _texCoordBuffer = _a._texCoordBuffer, _vertexShader = _a._vertexShader;
        _glOut.deleteProgram(_program);
        _glOut.deleteBuffer(_texCoordBuffer);
        _glOut.deleteBuffer(_positionBuffer);
        _glOut.deleteShader(_vertexShader);
        _glOut.deleteShader(_fragmentShader);
    };
    WebGL2PipelineProcessingStage.prototype.render = function () {
        var _a = this, _glOut = _a._glOut, _b = _a._outputDimensions, height = _b.height, width = _b.width, _outputFramebuffer = _a._outputFramebuffer, _outputTexture = _a._outputTexture, _outputTextureUnit = _a._outputTextureUnit, _program = _a._program;
        _glOut.viewport(0, 0, width, height);
        _glOut.useProgram(_program);
        if (_outputTexture) {
            _glOut.activeTexture(_glOut.TEXTURE0
                + _outputTextureUnit);
            _glOut.bindTexture(_glOut.TEXTURE_2D, _outputTexture);
        }
        _glOut.bindFramebuffer(_glOut.FRAMEBUFFER, _outputFramebuffer);
        _glOut.drawArrays(_glOut.TRIANGLE_STRIP, 0, 4);
    };
    WebGL2PipelineProcessingStage.prototype._setUniformVars = function (uniformVars) {
        var _a = this, _glOut = _a._glOut, _program = _a._program;
        _glOut.useProgram(_program);
        uniformVars.forEach(function (_a) {
            var name = _a.name, type = _a.type, values = _a.values;
            var uniformVarLocation = _glOut
                .getUniformLocation(_program, name);
            var isVector = type.split(':')[1] === 'v';
            if (isVector) {
                // @ts-ignore
                _glOut["uniform1".concat(type[0], "v")](uniformVarLocation, values);
            }
            else {
                // @ts-ignore
                _glOut["uniform".concat(values.length).concat(type[0])].apply(_glOut, __spreadArray([uniformVarLocation], values, false));
            }
        });
    };
    return WebGL2PipelineProcessingStage;
}());
exports.WebGL2PipelineProcessingStage = WebGL2PipelineProcessingStage;

},{"./webgl2PipelineHelpers":25}],24:[function(require,module,exports){
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
exports.WebGL2Pipeline = void 0;
var Pipeline_1 = require("../Pipeline");
var WebGL2PipelineInputStage_1 = require("./WebGL2PipelineInputStage");
var WebGL2PipelineProcessingStage_1 = require("./WebGL2PipelineProcessingStage");
/**
 * @private
 */
var WebGL2Pipeline = /** @class */ (function (_super) {
    __extends(WebGL2Pipeline, _super);
    function WebGL2Pipeline() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this._stages = [];
        return _this;
    }
    WebGL2Pipeline.prototype.cleanUp = function () {
        this._stages.forEach(function (stage) { return stage.cleanUp(); });
    };
    WebGL2Pipeline.prototype.render = function (inputFrame, inputTextureData) {
        var _a = this._stages, inputStage = _a[0], otherStages = _a.slice(1);
        inputStage.render(inputFrame, inputTextureData);
        otherStages.forEach(function (stage) { return stage
            .render(); });
    };
    WebGL2Pipeline.InputStage = WebGL2PipelineInputStage_1.WebGL2PipelineInputStage;
    WebGL2Pipeline.ProcessingStage = WebGL2PipelineProcessingStage_1.WebGL2PipelineProcessingStage;
    return WebGL2Pipeline;
}(Pipeline_1.Pipeline));
exports.WebGL2Pipeline = WebGL2Pipeline;

},{"../Pipeline":20,"./WebGL2PipelineInputStage":22,"./WebGL2PipelineProcessingStage":23}],25:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initBuffer = exports.createTexture = exports.compileShader = exports.createProgram = exports.createPipelineStageProgram = void 0;
/**
 * @private
 */
function createPipelineStageProgram(gl, vertexShader, fragmentShader, positionBuffer, texCoordBuffer) {
    var program = createProgram(gl, vertexShader, fragmentShader);
    var positionAttributeLocation = gl.getAttribLocation(program, 'a_position');
    gl.enableVertexAttribArray(positionAttributeLocation);
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);
    var texCoordAttributeLocation = gl.getAttribLocation(program, 'a_texCoord');
    gl.enableVertexAttribArray(texCoordAttributeLocation);
    gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
    gl.vertexAttribPointer(texCoordAttributeLocation, 2, gl.FLOAT, false, 0, 0);
    return program;
}
exports.createPipelineStageProgram = createPipelineStageProgram;
/**
 * @private
 */
function createProgram(gl, vertexShader, fragmentShader) {
    var program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        throw new Error("Could not link WebGL program: ".concat(gl.getProgramInfoLog(program)));
    }
    return program;
}
exports.createProgram = createProgram;
/**
 * @private
 */
function compileShader(gl, shaderType, shaderSource) {
    var shader = gl.createShader(shaderType);
    gl.shaderSource(shader, shaderSource);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        throw new Error("Could not compile shader: ".concat(gl.getShaderInfoLog(shader)));
    }
    return shader;
}
exports.compileShader = compileShader;
/**
 * @private
 */
function createTexture(gl, internalformat, width, height, minFilter, magFilter) {
    if (minFilter === void 0) { minFilter = gl.NEAREST; }
    if (magFilter === void 0) { magFilter = gl.NEAREST; }
    var texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, minFilter);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, magFilter);
    gl.texStorage2D(gl.TEXTURE_2D, 1, internalformat, width, height);
    return texture;
}
exports.createTexture = createTexture;
/**
 * @private
 */
function initBuffer(gl, data) {
    var buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW);
    return buffer;
}
exports.initBuffer = initBuffer;

},{}],26:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ImageFit = void 0;
/**
 * ImageFit specifies the positioning of an image inside a viewport.
 */
var ImageFit;
(function (ImageFit) {
    /**
     * Scale the image up or down to fill the viewport while preserving the aspect ratio.
     * The image will be fully visible but will add empty space in the viewport if
     * aspect ratios do not match.
     */
    ImageFit["Contain"] = "Contain";
    /**
     * Scale the image to fill both height and width of the viewport while preserving
     * the aspect ratio, but will crop the image if aspect ratios do not match.
     */
    ImageFit["Cover"] = "Cover";
    /**
     * Stretches the image to fill the viewport regardless of aspect ratio.
     */
    ImageFit["Fill"] = "Fill";
    /**
     * Ignore height and width and use the original size.
     */
    ImageFit["None"] = "None";
})(ImageFit || (exports.ImageFit = ImageFit = {}));

},{}],27:[function(require,module,exports){
"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Benchmark = void 0;
/**
 * @private
 */
var Benchmark = /** @class */ (function () {
    function Benchmark() {
        this._timingCache = new Map();
        this._timings = new Map();
    }
    Benchmark.prototype.end = function (name) {
        var timing = this._timings.get(name);
        if (!timing) {
            return;
        }
        timing.end = Date.now();
        timing.delay = timing.end - timing.start;
        this._save(name, __assign({}, timing));
    };
    Benchmark.prototype.getAverageDelay = function (name) {
        var timingCache = this._timingCache.get(name);
        if (!timingCache || !timingCache.length) {
            return;
        }
        return timingCache.map(function (timing) { return timing.delay; })
            .reduce(function (total, value) { return total += value; }, 0) / timingCache.length;
    };
    Benchmark.prototype.getNames = function () {
        return Array.from(this._timingCache.keys());
    };
    Benchmark.prototype.getRate = function (name) {
        var timingCache = this._timingCache.get(name);
        if (!timingCache || timingCache.length < 2) {
            return;
        }
        var totalDelay = timingCache[timingCache.length - 1].end - timingCache[0].start;
        return (timingCache.length / totalDelay) * 1000;
    };
    Benchmark.prototype.merge = function (benchmark) {
        var _this = this;
        var _timingCache = benchmark._timingCache, _timings = benchmark._timings;
        _timingCache.forEach(function (cache, name) { return _this._timingCache.set(name, cache); });
        _timings.forEach(function (timing, name) { return _this._timings.set(name, timing); });
    };
    Benchmark.prototype.start = function (name) {
        var timing = this._timings.get(name);
        if (!timing) {
            timing = {};
            this._timings.set(name, timing);
        }
        timing.start = Date.now();
        delete timing.end;
        delete timing.delay;
    };
    Benchmark.prototype._save = function (name, timing) {
        var timingCache = this._timingCache.get(name);
        if (!timingCache) {
            timingCache = [];
            this._timingCache.set(name, timingCache);
        }
        timingCache.push(timing);
        if (timingCache.length > Benchmark.cacheSize) {
            timingCache.splice(0, timingCache.length - Benchmark.cacheSize);
        }
    };
    // NOTE (csantos): How many timing information to save per benchmark.
    // This is about the amount of timing info generated on a 24fps input.
    // Enough samples to calculate fps
    Benchmark.cacheSize = 41;
    return Benchmark;
}());
exports.Benchmark = Benchmark;

},{}],28:[function(require,module,exports){
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CorsWorker = void 0;
var fixWorkerBasePathForFetch = function (basePath) {
    var fetchOrig = fetch;
    // @ts-ignore
    fetch = function (url, init) {
        return fetchOrig("".concat(basePath).concat(url), init);
    };
};
var fixWorkerBasePathForImportScripts = function (basePath) {
    var importScriptsOrig = importScripts;
    // @ts-ignore
    importScripts = function (url) {
        return importScriptsOrig("".concat(basePath).concat(url));
    };
};
var CorsWorker = /** @class */ (function () {
    function CorsWorker(url) {
        if (!/:\/\//.test(url) || new RegExp("^".concat(window.location.origin)).test(url)) {
            this.workerPromise = this._loadSameOrigin(url);
        }
        else {
            this.workerPromise = this._loadCrossOrigin(url);
        }
    }
    CorsWorker.prototype._loadCrossOrigin = function (url) {
        return __awaiter(this, void 0, void 0, function () {
            var response, code, type, basePath, dataUrl, dataBlob, workerUrl;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, fetch(url)];
                    case 1:
                        response = _a.sent();
                        return [4 /*yield*/, response.text()];
                    case 2:
                        code = _a.sent();
                        type = 'application/javascript';
                        basePath = "".concat(url.split('/').slice(0, -1).join('/'), "/");
                        dataUrl = [
                            "data:".concat(type, ","),
                            encodeURIComponent("(".concat(fixWorkerBasePathForFetch, ")(\"").concat(basePath, "\");")),
                            encodeURIComponent("(".concat(fixWorkerBasePathForImportScripts, ")(\"").concat(basePath, "\");")),
                            encodeURIComponent(code),
                        ].join('');
                        dataBlob = new Blob(["importScripts(\"".concat(dataUrl, "\")")], { type: type });
                        workerUrl = URL.createObjectURL(dataBlob);
                        return [2 /*return*/, new Worker(workerUrl)];
                }
            });
        });
    };
    CorsWorker.prototype._loadSameOrigin = function (url) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, new Worker(url)];
            });
        });
    };
    return CorsWorker;
}());
exports.CorsWorker = CorsWorker;

},{}],29:[function(require,module,exports){
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TwilioTFLite = void 0;
var isWebWorker = typeof WorkerGlobalScope !== 'undefined'
    && self instanceof WorkerGlobalScope;
var loadedScripts = new Set();
var model;
/**
 * @private
 */
var TwilioTFLite = /** @class */ (function () {
    function TwilioTFLite() {
        this._inputBuffer = null;
        this._isSimdEnabled = null;
        this._tflite = null;
    }
    Object.defineProperty(TwilioTFLite.prototype, "isSimdEnabled", {
        get: function () {
            return this._isSimdEnabled;
        },
        enumerable: false,
        configurable: true
    });
    TwilioTFLite.prototype.initialize = function (assetsPath, modelName, moduleLoaderName, moduleSimdLoaderName) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, modelResponse, _b, tflite, modelBufferOffset;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        if (this._tflite) {
                            return [2 /*return*/];
                        }
                        if (isWebWorker) {
                            // NOTE(mmalavalli): In a web worker, paths to other dependencies
                            // are determined relative to the assets path, so no need to append
                            // it to the file names of the dependencies.
                            assetsPath = '';
                        }
                        return [4 /*yield*/, Promise.all([
                                this._loadWasmModule(assetsPath, moduleLoaderName, moduleSimdLoaderName),
                                fetch("".concat(assetsPath).concat(modelName)),
                            ])];
                    case 1:
                        _a = _c.sent(), modelResponse = _a[1];
                        _b = model;
                        if (_b) return [3 /*break*/, 3];
                        return [4 /*yield*/, modelResponse.arrayBuffer()];
                    case 2:
                        _b = (_c.sent());
                        _c.label = 3;
                    case 3:
                        model = _b;
                        tflite = this._tflite;
                        modelBufferOffset = tflite._getModelBufferMemoryOffset();
                        tflite.HEAPU8.set(new Uint8Array(model), modelBufferOffset);
                        tflite._loadModel(model.byteLength);
                        return [2 /*return*/];
                }
            });
        });
    };
    TwilioTFLite.prototype.loadInputBuffer = function (inputBuffer) {
        var tflite = this._tflite;
        var height = tflite._getInputHeight();
        var width = tflite._getInputWidth();
        var pixels = width * height;
        var tfliteInputMemoryOffset = tflite._getInputMemoryOffset() / 4;
        for (var i = 0; i < pixels; i++) {
            var curTFLiteOffset = tfliteInputMemoryOffset + i * 3;
            var curImageBufferOffset = i * 4;
            tflite.HEAPF32[curTFLiteOffset] = inputBuffer[curImageBufferOffset] / 255;
            tflite.HEAPF32[curTFLiteOffset + 1] = inputBuffer[curImageBufferOffset + 1] / 255;
            tflite.HEAPF32[curTFLiteOffset + 2] = inputBuffer[curImageBufferOffset + 2] / 255;
        }
        this._inputBuffer = inputBuffer;
    };
    TwilioTFLite.prototype.runInference = function () {
        var tflite = this._tflite;
        var height = tflite._getInputHeight();
        var width = tflite._getInputWidth();
        var pixels = width * height;
        var tfliteOutputMemoryOffset = tflite._getOutputMemoryOffset() / 4;
        tflite._runInference();
        var inputBuffer = this._inputBuffer || new Uint8ClampedArray(pixels * 4);
        for (var i = 0; i < pixels; i++) {
            inputBuffer[i * 4 + 3] = Math.round(tflite.HEAPF32[tfliteOutputMemoryOffset + i] * 255);
        }
        return inputBuffer;
    };
    TwilioTFLite.prototype._loadScript = function (path) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                if (loadedScripts.has(path)) {
                    return [2 /*return*/];
                }
                if (isWebWorker) {
                    importScripts(path);
                    loadedScripts.add(path);
                    return [2 /*return*/];
                }
                return [2 /*return*/, new Promise(function (resolve, reject) {
                        var script = document.createElement('script');
                        script.onload = function () {
                            loadedScripts.add(path);
                            resolve();
                        };
                        script.onerror = function () {
                            reject();
                        };
                        document.head.append(script);
                        script.src = path;
                    })];
            });
        });
    };
    TwilioTFLite.prototype._loadWasmModule = function (assetsPath, moduleLoaderName, moduleSimdLoaderName) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, _b, _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        _d.trys.push([0, 3, , 6]);
                        return [4 /*yield*/, this._loadScript("".concat(assetsPath).concat(moduleSimdLoaderName))];
                    case 1:
                        _d.sent();
                        _a = this;
                        return [4 /*yield*/, createTwilioTFLiteSIMDModule()];
                    case 2:
                        _a._tflite = _d.sent();
                        this._isSimdEnabled = true;
                        return [3 /*break*/, 6];
                    case 3:
                        _b = _d.sent();
                        return [4 /*yield*/, this._loadScript("".concat(assetsPath).concat(moduleLoaderName))];
                    case 4:
                        _d.sent();
                        _c = this;
                        return [4 /*yield*/, createTwilioTFLiteModule()];
                    case 5:
                        _c._tflite = _d.sent();
                        this._isSimdEnabled = false;
                        return [3 /*break*/, 6];
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    return TwilioTFLite;
}());
exports.TwilioTFLite = TwilioTFLite;

},{}],30:[function(require,module,exports){
"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isSupported = exports.isCanvasBlurSupported = exports.isChromiumImageBitmap = exports.isBrowserSupported = void 0;
/**
 * @private
 */
function getCanvas() {
    return typeof OffscreenCanvas !== 'undefined' ? new OffscreenCanvas(1, 1) : document.createElement('canvas');
}
/**
 * @private
 */
function isBrowserSupported() {
    if (typeof window !== 'undefined' && typeof document !== 'undefined') {
        return !!(getCanvas().getContext('2d') || getCanvas().getContext('webgl2'));
    }
    else {
        return false;
    }
}
exports.isBrowserSupported = isBrowserSupported;
/**
 * @private
 */
function isChromiumImageBitmap() {
    return /Chrome/.test(navigator.userAgent)
        && typeof createImageBitmap === 'function';
}
exports.isChromiumImageBitmap = isChromiumImageBitmap;
/**
 * @private
 */
exports.isCanvasBlurSupported = (function () {
    var blackPixel = [0, 0, 0, 255];
    var whitePixel = [255, 255, 255, 255];
    var inputImageData = new ImageData(new Uint8ClampedArray(__spreadArray(__spreadArray(__spreadArray(__spreadArray(__spreadArray(__spreadArray(__spreadArray(__spreadArray(__spreadArray([], blackPixel, true), blackPixel, true), blackPixel, true), blackPixel, true), whitePixel, true), blackPixel, true), blackPixel, true), blackPixel, true), blackPixel, true)), 3, 3);
    var canvas = getCanvas();
    var context = canvas.getContext('2d');
    canvas.width = 3;
    canvas.height = 3;
    context.putImageData(inputImageData, 0, 0);
    context.filter = 'blur(1px)';
    context.drawImage(canvas, 0, 0);
    var data = context.getImageData(0, 0, 3, 3).data;
    return data[0] > 0;
})();
/**
 * Check if the current browser is officially supported by twilio-video-procesors.js.
 * This is set to `true` for browsers that supports canvas
 * [2D](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D) or
 * [webgl2](https://developer.mozilla.org/en-US/docs/Web/API/WebGL2RenderingContext)
 * rendering context.
 * @example
 * ```ts
 * import { isSupported } from '@twilio/video-processors';
 *
 * if (isSupported) {
 *   // Initialize the background processors
 * }
 * ```
 */
exports.isSupported = isBrowserSupported();

},{}],31:[function(require,module,exports){
"use strict";
// This file is generated on build. To make changes, see scripts/version.js
Object.defineProperty(exports, "__esModule", { value: true });
exports.version = void 0;
/**
 * The current version of the library.
 */
exports.version = '3.0.0-preview.2';

},{}],32:[function(require,module,exports){
(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
    typeof define === 'function' && define.amd ? define(['exports'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.Comlink = {}));
})(this, (function (exports) { 'use strict';

    /**
     * @license
     * Copyright 2019 Google LLC
     * SPDX-License-Identifier: Apache-2.0
     */
    const proxyMarker = Symbol("Comlink.proxy");
    const createEndpoint = Symbol("Comlink.endpoint");
    const releaseProxy = Symbol("Comlink.releaseProxy");
    const finalizer = Symbol("Comlink.finalizer");
    const throwMarker = Symbol("Comlink.thrown");
    const isObject = (val) => (typeof val === "object" && val !== null) || typeof val === "function";
    /**
     * Internal transfer handle to handle objects marked to proxy.
     */
    const proxyTransferHandler = {
        canHandle: (val) => isObject(val) && val[proxyMarker],
        serialize(obj) {
            const { port1, port2 } = new MessageChannel();
            expose(obj, port1);
            return [port2, [port2]];
        },
        deserialize(port) {
            port.start();
            return wrap(port);
        },
    };
    /**
     * Internal transfer handler to handle thrown exceptions.
     */
    const throwTransferHandler = {
        canHandle: (value) => isObject(value) && throwMarker in value,
        serialize({ value }) {
            let serialized;
            if (value instanceof Error) {
                serialized = {
                    isError: true,
                    value: {
                        message: value.message,
                        name: value.name,
                        stack: value.stack,
                    },
                };
            }
            else {
                serialized = { isError: false, value };
            }
            return [serialized, []];
        },
        deserialize(serialized) {
            if (serialized.isError) {
                throw Object.assign(new Error(serialized.value.message), serialized.value);
            }
            throw serialized.value;
        },
    };
    /**
     * Allows customizing the serialization of certain values.
     */
    const transferHandlers = new Map([
        ["proxy", proxyTransferHandler],
        ["throw", throwTransferHandler],
    ]);
    function isAllowedOrigin(allowedOrigins, origin) {
        for (const allowedOrigin of allowedOrigins) {
            if (origin === allowedOrigin || allowedOrigin === "*") {
                return true;
            }
            if (allowedOrigin instanceof RegExp && allowedOrigin.test(origin)) {
                return true;
            }
        }
        return false;
    }
    function expose(obj, ep = globalThis, allowedOrigins = ["*"]) {
        ep.addEventListener("message", function callback(ev) {
            if (!ev || !ev.data) {
                return;
            }
            if (!isAllowedOrigin(allowedOrigins, ev.origin)) {
                console.warn(`Invalid origin '${ev.origin}' for comlink proxy`);
                return;
            }
            const { id, type, path } = Object.assign({ path: [] }, ev.data);
            const argumentList = (ev.data.argumentList || []).map(fromWireValue);
            let returnValue;
            try {
                const parent = path.slice(0, -1).reduce((obj, prop) => obj[prop], obj);
                const rawValue = path.reduce((obj, prop) => obj[prop], obj);
                switch (type) {
                    case "GET" /* MessageType.GET */:
                        {
                            returnValue = rawValue;
                        }
                        break;
                    case "SET" /* MessageType.SET */:
                        {
                            parent[path.slice(-1)[0]] = fromWireValue(ev.data.value);
                            returnValue = true;
                        }
                        break;
                    case "APPLY" /* MessageType.APPLY */:
                        {
                            returnValue = rawValue.apply(parent, argumentList);
                        }
                        break;
                    case "CONSTRUCT" /* MessageType.CONSTRUCT */:
                        {
                            const value = new rawValue(...argumentList);
                            returnValue = proxy(value);
                        }
                        break;
                    case "ENDPOINT" /* MessageType.ENDPOINT */:
                        {
                            const { port1, port2 } = new MessageChannel();
                            expose(obj, port2);
                            returnValue = transfer(port1, [port1]);
                        }
                        break;
                    case "RELEASE" /* MessageType.RELEASE */:
                        {
                            returnValue = undefined;
                        }
                        break;
                    default:
                        return;
                }
            }
            catch (value) {
                returnValue = { value, [throwMarker]: 0 };
            }
            Promise.resolve(returnValue)
                .catch((value) => {
                return { value, [throwMarker]: 0 };
            })
                .then((returnValue) => {
                const [wireValue, transferables] = toWireValue(returnValue);
                ep.postMessage(Object.assign(Object.assign({}, wireValue), { id }), transferables);
                if (type === "RELEASE" /* MessageType.RELEASE */) {
                    // detach and deactive after sending release response above.
                    ep.removeEventListener("message", callback);
                    closeEndPoint(ep);
                    if (finalizer in obj && typeof obj[finalizer] === "function") {
                        obj[finalizer]();
                    }
                }
            })
                .catch((error) => {
                // Send Serialization Error To Caller
                const [wireValue, transferables] = toWireValue({
                    value: new TypeError("Unserializable return value"),
                    [throwMarker]: 0,
                });
                ep.postMessage(Object.assign(Object.assign({}, wireValue), { id }), transferables);
            });
        });
        if (ep.start) {
            ep.start();
        }
    }
    function isMessagePort(endpoint) {
        return endpoint.constructor.name === "MessagePort";
    }
    function closeEndPoint(endpoint) {
        if (isMessagePort(endpoint))
            endpoint.close();
    }
    function wrap(ep, target) {
        return createProxy(ep, [], target);
    }
    function throwIfProxyReleased(isReleased) {
        if (isReleased) {
            throw new Error("Proxy has been released and is not useable");
        }
    }
    function releaseEndpoint(ep) {
        return requestResponseMessage(ep, {
            type: "RELEASE" /* MessageType.RELEASE */,
        }).then(() => {
            closeEndPoint(ep);
        });
    }
    const proxyCounter = new WeakMap();
    const proxyFinalizers = "FinalizationRegistry" in globalThis &&
        new FinalizationRegistry((ep) => {
            const newCount = (proxyCounter.get(ep) || 0) - 1;
            proxyCounter.set(ep, newCount);
            if (newCount === 0) {
                releaseEndpoint(ep);
            }
        });
    function registerProxy(proxy, ep) {
        const newCount = (proxyCounter.get(ep) || 0) + 1;
        proxyCounter.set(ep, newCount);
        if (proxyFinalizers) {
            proxyFinalizers.register(proxy, ep, proxy);
        }
    }
    function unregisterProxy(proxy) {
        if (proxyFinalizers) {
            proxyFinalizers.unregister(proxy);
        }
    }
    function createProxy(ep, path = [], target = function () { }) {
        let isProxyReleased = false;
        const proxy = new Proxy(target, {
            get(_target, prop) {
                throwIfProxyReleased(isProxyReleased);
                if (prop === releaseProxy) {
                    return () => {
                        unregisterProxy(proxy);
                        releaseEndpoint(ep);
                        isProxyReleased = true;
                    };
                }
                if (prop === "then") {
                    if (path.length === 0) {
                        return { then: () => proxy };
                    }
                    const r = requestResponseMessage(ep, {
                        type: "GET" /* MessageType.GET */,
                        path: path.map((p) => p.toString()),
                    }).then(fromWireValue);
                    return r.then.bind(r);
                }
                return createProxy(ep, [...path, prop]);
            },
            set(_target, prop, rawValue) {
                throwIfProxyReleased(isProxyReleased);
                // FIXME: ES6 Proxy Handler `set` methods are supposed to return a
                // boolean. To show good will, we return true asynchronously ¯\_(ツ)_/¯
                const [value, transferables] = toWireValue(rawValue);
                return requestResponseMessage(ep, {
                    type: "SET" /* MessageType.SET */,
                    path: [...path, prop].map((p) => p.toString()),
                    value,
                }, transferables).then(fromWireValue);
            },
            apply(_target, _thisArg, rawArgumentList) {
                throwIfProxyReleased(isProxyReleased);
                const last = path[path.length - 1];
                if (last === createEndpoint) {
                    return requestResponseMessage(ep, {
                        type: "ENDPOINT" /* MessageType.ENDPOINT */,
                    }).then(fromWireValue);
                }
                // We just pretend that `bind()` didn’t happen.
                if (last === "bind") {
                    return createProxy(ep, path.slice(0, -1));
                }
                const [argumentList, transferables] = processArguments(rawArgumentList);
                return requestResponseMessage(ep, {
                    type: "APPLY" /* MessageType.APPLY */,
                    path: path.map((p) => p.toString()),
                    argumentList,
                }, transferables).then(fromWireValue);
            },
            construct(_target, rawArgumentList) {
                throwIfProxyReleased(isProxyReleased);
                const [argumentList, transferables] = processArguments(rawArgumentList);
                return requestResponseMessage(ep, {
                    type: "CONSTRUCT" /* MessageType.CONSTRUCT */,
                    path: path.map((p) => p.toString()),
                    argumentList,
                }, transferables).then(fromWireValue);
            },
        });
        registerProxy(proxy, ep);
        return proxy;
    }
    function myFlat(arr) {
        return Array.prototype.concat.apply([], arr);
    }
    function processArguments(argumentList) {
        const processed = argumentList.map(toWireValue);
        return [processed.map((v) => v[0]), myFlat(processed.map((v) => v[1]))];
    }
    const transferCache = new WeakMap();
    function transfer(obj, transfers) {
        transferCache.set(obj, transfers);
        return obj;
    }
    function proxy(obj) {
        return Object.assign(obj, { [proxyMarker]: true });
    }
    function windowEndpoint(w, context = globalThis, targetOrigin = "*") {
        return {
            postMessage: (msg, transferables) => w.postMessage(msg, targetOrigin, transferables),
            addEventListener: context.addEventListener.bind(context),
            removeEventListener: context.removeEventListener.bind(context),
        };
    }
    function toWireValue(value) {
        for (const [name, handler] of transferHandlers) {
            if (handler.canHandle(value)) {
                const [serializedValue, transferables] = handler.serialize(value);
                return [
                    {
                        type: "HANDLER" /* WireValueType.HANDLER */,
                        name,
                        value: serializedValue,
                    },
                    transferables,
                ];
            }
        }
        return [
            {
                type: "RAW" /* WireValueType.RAW */,
                value,
            },
            transferCache.get(value) || [],
        ];
    }
    function fromWireValue(value) {
        switch (value.type) {
            case "HANDLER" /* WireValueType.HANDLER */:
                return transferHandlers.get(value.name).deserialize(value.value);
            case "RAW" /* WireValueType.RAW */:
                return value.value;
        }
    }
    function requestResponseMessage(ep, msg, transfers) {
        return new Promise((resolve) => {
            const id = generateUUID();
            ep.addEventListener("message", function l(ev) {
                if (!ev.data || !ev.data.id || ev.data.id !== id) {
                    return;
                }
                ep.removeEventListener("message", l);
                resolve(ev.data);
            });
            if (ep.start) {
                ep.start();
            }
            ep.postMessage(Object.assign({ id }, msg), transfers);
        });
    }
    function generateUUID() {
        return new Array(4)
            .fill(0)
            .map(() => Math.floor(Math.random() * Number.MAX_SAFE_INTEGER).toString(16))
            .join("-");
    }

    exports.createEndpoint = createEndpoint;
    exports.expose = expose;
    exports.finalizer = finalizer;
    exports.proxy = proxy;
    exports.proxyMarker = proxyMarker;
    exports.releaseProxy = releaseProxy;
    exports.transfer = transfer;
    exports.transferHandlers = transferHandlers;
    exports.windowEndpoint = windowEndpoint;
    exports.wrap = wrap;

}));


},{}]},{},[2]);
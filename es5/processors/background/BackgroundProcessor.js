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
var version_1 = require("../../utils/version");
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
        // This version is read by the Video SDK
        // tslint:disable-next-line no-unused-variable
        _this._version = version_1.version;
        var assetsPath = options.assetsPath, _a = options.deferInputFrameDownscale, deferInputFrameDownscale = _a === void 0 ? _this._deferInputFrameDownscale : _a, _b = options.maskBlurRadius, maskBlurRadius = _b === void 0 ? _this._maskBlurRadius : _b;
        if (typeof assetsPath !== 'string') {
            throw new Error('assetsPath parameter must be a string');
        }
        // Ensures assetsPath ends with a trailing slash ('/').
        _this._assetsPath = assetsPath.replace(/([^/])$/, '$1/');
        _this._backgroundProcessorPipeline = backgroundProcessorPipeline;
        // @ts-expect-error - _benchmark is a private property in the pipeline classes definition
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
                        _b = this._getFrameDimensions(inputFrameBuffer), captureWidth = _b.width, captureHeight = _b.height;
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
                        return [4 /*yield*/, _backgroundProcessorPipeline.render(inputFrame)];
                    case 1:
                        _c = _d.sent();
                        return [3 /*break*/, 4];
                    case 2: return [4 /*yield*/, _backgroundProcessorPipeline.render(inputFrame instanceof OffscreenCanvas
                            ? inputFrame.transferToImageBitmap()
                            : inputFrame // TODO(lrivas): Review why we need to cast to VideoFrame, this breaks when using 'canvas' as inputFrameBufferType
                        )];
                    case 3:
                        _c = _d.sent();
                        _d.label = 4;
                    case 4:
                        outputFrame = _c;
                        // Render the processed frame through the output frame buffer context
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
    /**
     * Gets the dimensions of a frame buffer based on its type
    */
    BackgroundProcessor.prototype._getFrameDimensions = function (buffer) {
        if (buffer instanceof HTMLVideoElement) {
            return { width: buffer.videoWidth, height: buffer.videoHeight };
        }
        if (buffer instanceof VideoFrame) {
            return { width: buffer.displayWidth, height: buffer.displayHeight };
        }
        return { width: buffer.width, height: buffer.height };
    };
    return BackgroundProcessor;
}(Processor_1.Processor));
exports.BackgroundProcessor = BackgroundProcessor;
//# sourceMappingURL=BackgroundProcessor.js.map
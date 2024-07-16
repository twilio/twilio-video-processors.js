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
var Processor_1 = require("../Processor");
var Benchmark_1 = require("../../utils/Benchmark");
var TwilioTFLite_1 = require("../../utils/TwilioTFLite");
var support_1 = require("../../utils/support");
var types_1 = require("../../types");
var webgl2_1 = require("../webgl2");
var constants_1 = require("../../constants");
/**
 * @private
 */
var BackgroundProcessor = /** @class */ (function (_super) {
    __extends(BackgroundProcessor, _super);
    function BackgroundProcessor(options) {
        var _this = _super.call(this) || this;
        _this._backgroundImage = null;
        _this._outputCanvas = null;
        _this._outputContext = null;
        _this._webgl2Pipeline = null;
        _this._inferenceDimensions = constants_1.WASM_INFERENCE_DIMENSIONS;
        if (typeof options.assetsPath !== 'string') {
            throw new Error('assetsPath parameter is missing');
        }
        var assetsPath = options.assetsPath;
        if (assetsPath && assetsPath[assetsPath.length - 1] !== '/') {
            assetsPath += '/';
        }
        _this._assetsPath = assetsPath;
        _this._debounce = typeof options.debounce === 'boolean' ? options.debounce : true;
        _this._deferInputResize = typeof options.deferInputResize === 'boolean' ? options.deferInputResize : false;
        _this._inferenceDimensions = options.inferenceDimensions || _this._inferenceDimensions;
        _this._inputResizeMode = typeof options.inputResizeMode === 'string'
            ? options.inputResizeMode
            : ((0, support_1.isChromiumImageBitmap)() ? 'image-bitmap' : 'canvas');
        _this._pipeline = options.pipeline || types_1.Pipeline.WebGL2;
        _this._benchmark = new Benchmark_1.Benchmark();
        _this._currentMask = null;
        _this._isSimdEnabled = null;
        _this._inferenceInputCanvas = typeof OffscreenCanvas !== 'undefined' ? new OffscreenCanvas(1, 1) : document.createElement('canvas');
        _this._inferenceInputContext = _this._inferenceInputCanvas.getContext('2d', { willReadFrequently: true });
        _this._inputFrameCanvas = typeof OffscreenCanvas !== 'undefined' ? new OffscreenCanvas(1, 1) : document.createElement('canvas');
        _this._inputFrameContext = _this._inputFrameCanvas.getContext('2d');
        _this._maskBlurRadius = typeof options.maskBlurRadius === 'number' ? options.maskBlurRadius : (_this._pipeline === types_1.Pipeline.WebGL2 ? constants_1.MASK_BLUR_RADIUS : (constants_1.MASK_BLUR_RADIUS / 2));
        _this._maskCanvas = typeof OffscreenCanvas !== 'undefined' ? new OffscreenCanvas(1, 1) : document.createElement('canvas');
        _this._maskContext = _this._maskCanvas.getContext('2d');
        return _this;
    }
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
            var _a;
            if (typeof radius !== 'number' || radius < 0) {
                console.warn("Valid mask blur radius not found. Using ".concat(constants_1.MASK_BLUR_RADIUS, " as default."));
                radius = constants_1.MASK_BLUR_RADIUS;
            }
            if (this._maskBlurRadius !== radius) {
                this._maskBlurRadius = radius;
                (_a = this._webgl2Pipeline) === null || _a === void 0 ? void 0 : _a.updatePostProcessingConfig({
                    jointBilateralFilter: {
                        sigmaSpace: this._maskBlurRadius
                    }
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
            var tflite;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        tflite = BackgroundProcessor._tflite;
                        if (!!tflite) return [3 /*break*/, 2];
                        tflite = new TwilioTFLite_1.TwilioTFLite();
                        return [4 /*yield*/, tflite.initialize(this._assetsPath, constants_1.MODEL_NAME, constants_1.TFLITE_LOADER_NAME, constants_1.TFLITE_SIMD_LOADER_NAME)];
                    case 1:
                        _a.sent();
                        BackgroundProcessor._tflite = tflite;
                        _a.label = 2;
                    case 2:
                        this._isSimdEnabled = tflite.isSimdEnabled;
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
     * that can be rendered off screen. Only works when using [[Pipeline.Canvas2D]].
     * <br/>
     * <br/>
     * [HTMLCanvasElement](https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement) - This is recommended on browsers
     * that doesn't support `OffscreenCanvas`, or if you need to render the frame on the screen. Only works when using [[Pipeline.Canvas2D]].
     * <br/>
     * <br/>
     * [HTMLVideoElement](https://developer.mozilla.org/en-US/docs/Web/API/HTMLVideoElement) - Recommended when using [[Pipeline.WebGL2]] but
     * works for both [[Pipeline.Canvas2D]] and [[Pipeline.WebGL2]].
     * <br/>
     * @param outputFrameBuffer - The output frame buffer to use to draw the processed frame.
     */
    BackgroundProcessor.prototype.processFrame = function (inputFrameBuffer, outputFrameBuffer) {
        var _a, _b, _c;
        return __awaiter(this, void 0, void 0, function () {
            var _d, inferenceWidth, inferenceHeight, _e, captureWidth, captureHeight, inputFrame, personMask, ctx, _f, outputHeight, outputWidth;
            return __generator(this, function (_g) {
                switch (_g.label) {
                    case 0:
                        if (!BackgroundProcessor._tflite) {
                            return [2 /*return*/];
                        }
                        if (!inputFrameBuffer || !outputFrameBuffer) {
                            throw new Error('Missing input or output frame buffer');
                        }
                        this._benchmark.end('captureFrameDelay');
                        this._benchmark.start('processFrameDelay');
                        _d = this._inferenceDimensions, inferenceWidth = _d.width, inferenceHeight = _d.height;
                        _e = inputFrameBuffer instanceof HTMLVideoElement
                            ? { width: inputFrameBuffer.videoWidth, height: inputFrameBuffer.videoHeight }
                            : inputFrameBuffer, captureWidth = _e.width, captureHeight = _e.height;
                        if (this._outputCanvas !== outputFrameBuffer) {
                            this._outputCanvas = outputFrameBuffer;
                            this._outputContext = this._outputCanvas
                                .getContext(this._pipeline === types_1.Pipeline.Canvas2D ? '2d' : 'webgl2');
                            (_a = this._webgl2Pipeline) === null || _a === void 0 ? void 0 : _a.cleanUp();
                            this._webgl2Pipeline = null;
                        }
                        if (this._pipeline === types_1.Pipeline.WebGL2) {
                            if (!this._webgl2Pipeline) {
                                this._createWebGL2Pipeline(inputFrameBuffer, captureWidth, captureHeight, inferenceWidth, inferenceHeight);
                            }
                            (_b = this._webgl2Pipeline) === null || _b === void 0 ? void 0 : _b.sampleInputFrame();
                        }
                        // Only set the canvas' dimensions if they have changed to prevent unnecessary redraw
                        if (this._inputFrameCanvas.width !== captureWidth) {
                            this._inputFrameCanvas.width = captureWidth;
                        }
                        if (this._inputFrameCanvas.height !== captureHeight) {
                            this._inputFrameCanvas.height = captureHeight;
                        }
                        if (this._inferenceInputCanvas.width !== inferenceWidth) {
                            this._inferenceInputCanvas.width = inferenceWidth;
                            this._maskCanvas.width = inferenceWidth;
                        }
                        if (this._inferenceInputCanvas.height !== inferenceHeight) {
                            this._inferenceInputCanvas.height = inferenceHeight;
                            this._maskCanvas.height = inferenceHeight;
                        }
                        if (inputFrameBuffer instanceof HTMLVideoElement) {
                            this._inputFrameContext.drawImage(inputFrameBuffer, 0, 0);
                            inputFrame = this._inputFrameCanvas;
                        }
                        else {
                            inputFrame = inputFrameBuffer;
                        }
                        return [4 /*yield*/, this._createPersonMask(inputFrame)];
                    case 1:
                        personMask = _g.sent();
                        if (this._debounce) {
                            this._currentMask = this._currentMask === personMask
                                ? null
                                : personMask;
                        }
                        if (this._pipeline === types_1.Pipeline.WebGL2) {
                            (_c = this._webgl2Pipeline) === null || _c === void 0 ? void 0 : _c.render(personMask.data);
                        }
                        else {
                            this._benchmark.start('imageCompositionDelay');
                            if (!this._debounce || this._currentMask) {
                                this._maskContext.putImageData(personMask, 0, 0);
                            }
                            ctx = this._outputContext;
                            _f = this._outputCanvas, outputHeight = _f.height, outputWidth = _f.width;
                            ctx.save();
                            ctx.filter = "blur(".concat(this._maskBlurRadius, "px)");
                            ctx.globalCompositeOperation = 'copy';
                            ctx.drawImage(this._maskCanvas, 0, 0, outputWidth, outputHeight);
                            ctx.filter = 'none';
                            ctx.globalCompositeOperation = 'source-in';
                            ctx.drawImage(inputFrame, 0, 0, outputWidth, outputHeight);
                            ctx.globalCompositeOperation = 'destination-over';
                            this._setBackground(inputFrame);
                            ctx.restore();
                            this._benchmark.end('imageCompositionDelay');
                        }
                        this._benchmark.end('processFrameDelay');
                        this._benchmark.end('totalProcessingDelay');
                        // NOTE (csantos): Start the benchmark from here so we can include the delay from the Video sdk
                        // for a more accurate fps
                        this._benchmark.start('totalProcessingDelay');
                        this._benchmark.start('captureFrameDelay');
                        return [2 /*return*/];
                }
            });
        });
    };
    BackgroundProcessor.prototype._createPersonMask = function (inputFrame) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, height, width, stages, shouldDebounce, inferenceStage, resizeStage, resizePromise, personMaskBuffer;
            var _this = this;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = this._inferenceDimensions, height = _a.height, width = _a.width;
                        stages = {
                            inference: {
                                false: function () { return BackgroundProcessor._tflite.runInference(); },
                                true: function () { return _this._currentMask.data; }
                            },
                            resize: {
                                false: function () { return __awaiter(_this, void 0, void 0, function () { return __generator(this, function (_a) {
                                    return [2 /*return*/, this._resizeInputFrame(inputFrame)];
                                }); }); },
                                true: function () { return __awaiter(_this, void 0, void 0, function () { return __generator(this, function (_a) {
                                    return [2 /*return*/];
                                }); }); }
                            }
                        };
                        shouldDebounce = !!this._currentMask;
                        inferenceStage = stages.inference["".concat(shouldDebounce)];
                        resizeStage = stages.resize["".concat(shouldDebounce)];
                        this._benchmark.start('inputImageResizeDelay');
                        resizePromise = resizeStage();
                        if (!!this._deferInputResize) return [3 /*break*/, 2];
                        return [4 /*yield*/, resizePromise];
                    case 1:
                        _b.sent();
                        _b.label = 2;
                    case 2:
                        this._benchmark.end('inputImageResizeDelay');
                        this._benchmark.start('segmentationDelay');
                        personMaskBuffer = inferenceStage();
                        this._benchmark.end('segmentationDelay');
                        return [2 /*return*/, this._currentMask || new ImageData(personMaskBuffer, width, height)];
                }
            });
        });
    };
    BackgroundProcessor.prototype._createWebGL2Pipeline = function (inputFrame, captureWidth, captureHeight, inferenceWidth, inferenceHeight) {
        this._webgl2Pipeline = (0, webgl2_1.buildWebGL2Pipeline)({
            htmlElement: inputFrame,
            width: captureWidth,
            height: captureHeight,
        }, this._backgroundImage, {
            type: this._getWebGL2PipelineType(),
        }, {
            inputResolution: "".concat(inferenceWidth, "x").concat(inferenceHeight),
        }, this._outputCanvas, this._benchmark, this._debounce);
        this._webgl2Pipeline.updatePostProcessingConfig({
            jointBilateralFilter: {
                sigmaSpace: this._maskBlurRadius,
                sigmaColor: 0.1
            },
            coverage: [
                0,
                0.99
            ],
            lightWrapping: 0,
            blendMode: 'screen'
        });
    };
    BackgroundProcessor.prototype._resizeInputFrame = function (inputFrame) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, _b, resizeWidth, resizeHeight, ctx, resizeMode, resizedInputFrameBitmap, imageData;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _a = this, _b = _a._inferenceInputCanvas, resizeWidth = _b.width, resizeHeight = _b.height, ctx = _a._inferenceInputContext, resizeMode = _a._inputResizeMode;
                        if (!(resizeMode === 'image-bitmap')) return [3 /*break*/, 2];
                        return [4 /*yield*/, createImageBitmap(inputFrame, {
                                resizeWidth: resizeWidth,
                                resizeHeight: resizeHeight,
                                resizeQuality: 'pixelated'
                            })];
                    case 1:
                        resizedInputFrameBitmap = _c.sent();
                        ctx.drawImage(resizedInputFrameBitmap, 0, 0, resizeWidth, resizeHeight);
                        resizedInputFrameBitmap.close();
                        return [3 /*break*/, 3];
                    case 2:
                        ctx.drawImage(inputFrame, 0, 0, resizeWidth, resizeHeight);
                        _c.label = 3;
                    case 3:
                        imageData = ctx.getImageData(0, 0, resizeWidth, resizeHeight);
                        BackgroundProcessor._tflite.loadInputBuffer(imageData.data);
                        return [2 /*return*/];
                }
            });
        });
    };
    BackgroundProcessor._tflite = null;
    return BackgroundProcessor;
}(Processor_1.Processor));
exports.BackgroundProcessor = BackgroundProcessor;
//# sourceMappingURL=BackgroundProcessor.js.map
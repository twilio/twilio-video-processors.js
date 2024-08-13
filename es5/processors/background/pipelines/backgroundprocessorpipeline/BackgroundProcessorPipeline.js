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
//# sourceMappingURL=BackgroundProcessorPipeline.js.map
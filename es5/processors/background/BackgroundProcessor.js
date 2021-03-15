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
        while (_) try {
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
require("@tensorflow/tfjs-backend-webgl");
require("@tensorflow/tfjs-backend-cpu");
var body_pix_1 = require("@tensorflow-models/body-pix");
var constants_1 = require("../../constants");
var Processor_1 = require("../Processor");
var Benchmark_1 = require("../../utils/Benchmark");
var BackgroundProcessor = /** @class */ (function (_super) {
    __extends(BackgroundProcessor, _super);
    function BackgroundProcessor(options) {
        var _this = _super.call(this) || this;
        _this._inferenceConfig = constants_1.INFERENCE_CONFIG;
        _this._inferenceResolution = constants_1.INFERENCE_RESOLUTION;
        _this._maskBlurRadius = constants_1.MASK_BLUR_RADIUS;
        _this.inferenceConfig = options === null || options === void 0 ? void 0 : options.inferenceConfig;
        _this.inferenceResolution = options === null || options === void 0 ? void 0 : options.inferenceResolution;
        _this.maskBlurRadius = options === null || options === void 0 ? void 0 : options.maskBlurRadius;
        _this._benchmark = new Benchmark_1.Benchmark();
        _this._inputCanvas = document.createElement('canvas');
        _this._inputContext = _this._inputCanvas.getContext('2d');
        _this._maskCanvas = new OffscreenCanvas(1, 1);
        _this._maskContext = _this._maskCanvas.getContext('2d');
        _this._outputCanvas = new OffscreenCanvas(1, 1);
        _this._outputContext = _this._outputCanvas.getContext('2d');
        BackgroundProcessor._loadModel();
        return _this;
    }
    BackgroundProcessor._loadModel = function (config) {
        if (config === void 0) { config = constants_1.MODEL_CONFIG; }
        return __awaiter(this, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = BackgroundProcessor;
                        return [4 /*yield*/, body_pix_1.load(config)
                                .catch(function (error) { return console.error('Unable to load model.', error); })];
                    case 1:
                        _a._model = (_b.sent()) || null;
                        return [2 /*return*/];
                }
            });
        });
    };
    Object.defineProperty(BackgroundProcessor.prototype, "benchmark", {
        get: function () {
            return this._benchmark;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(BackgroundProcessor.prototype, "inferenceConfig", {
        get: function () {
            return this._inferenceConfig;
        },
        set: function (config) {
            if (!config || !Object.keys(config).length) {
                console.warn('Inference config not found. Using defaults.');
                config = constants_1.INFERENCE_CONFIG;
            }
            this._inferenceConfig = config;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(BackgroundProcessor.prototype, "inferenceResolution", {
        get: function () {
            return this._inferenceResolution;
        },
        set: function (resolution) {
            if (!resolution || !resolution.height || !resolution.width) {
                console.warn('Valid inference resolution not found. Using defaults');
                resolution = constants_1.INFERENCE_RESOLUTION;
            }
            this._inferenceResolution = resolution;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(BackgroundProcessor.prototype, "maskBlurRadius", {
        get: function () {
            return this._maskBlurRadius;
        },
        set: function (radius) {
            if (!radius) {
                console.warn("Valid mask blur radius not found. Using " + constants_1.MASK_BLUR_RADIUS + " as default.");
                radius = constants_1.MASK_BLUR_RADIUS;
            }
            this._maskBlurRadius = radius;
        },
        enumerable: false,
        configurable: true
    });
    BackgroundProcessor.prototype.processFrame = function (inputFrame) {
        return __awaiter(this, void 0, void 0, function () {
            var captureWidth, captureHeight, _a, inferenceWidth, inferenceHeight, imageData, segment;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!BackgroundProcessor._model) {
                            return [2 /*return*/, inputFrame];
                        }
                        this._benchmark.end('processFrame(jsdk)');
                        this._benchmark.start('processFrame(processor)');
                        this._benchmark.start('resizeInputImage');
                        captureWidth = inputFrame.width, captureHeight = inputFrame.height;
                        _a = this._inferenceResolution, inferenceWidth = _a.width, inferenceHeight = _a.height;
                        this._inputCanvas.width = inferenceWidth;
                        this._inputCanvas.height = inferenceHeight;
                        this._maskCanvas.width = inferenceWidth;
                        this._maskCanvas.height = inferenceHeight;
                        this._outputCanvas.width = captureWidth;
                        this._outputCanvas.height = captureHeight;
                        this._inputContext.drawImage(inputFrame, 0, 0, inferenceWidth, inferenceHeight);
                        imageData = this._inputContext.getImageData(0, 0, inferenceWidth, inferenceHeight);
                        this._benchmark.end('resizeInputImage');
                        this._benchmark.start('segmentPerson');
                        return [4 /*yield*/, BackgroundProcessor._model.segmentPerson(imageData, this._inferenceConfig)];
                    case 1:
                        segment = _b.sent();
                        this._benchmark.end('segmentPerson');
                        this._benchmark.start('imageCompositing');
                        this._maskContext.putImageData(this._createPersonMask(segment), 0, 0);
                        this._outputContext.save();
                        this._outputContext.filter = "blur(" + this._maskBlurRadius + "px)";
                        this._outputContext.globalCompositeOperation = 'copy';
                        this._outputContext.drawImage(this._maskCanvas, 0, 0, captureWidth, captureHeight);
                        this._outputContext.filter = 'none';
                        this._outputContext.globalCompositeOperation = 'source-in';
                        this._outputContext.drawImage(inputFrame, 0, 0, captureWidth, captureHeight);
                        this._outputContext.globalCompositeOperation = 'destination-over';
                        this._setBackground(inputFrame);
                        this._outputContext.restore();
                        this._benchmark.end('imageCompositing');
                        this._benchmark.end('processFrame(processor)');
                        this._benchmark.end('processFrame');
                        // NOTE (csantos): Start the benchmark from here so we can include the delay from the Video sdk
                        // for a more accurate fps
                        this._benchmark.start('processFrame');
                        this._benchmark.start('processFrame(jsdk)');
                        return [2 /*return*/, this._outputCanvas];
                }
            });
        });
    };
    BackgroundProcessor.prototype._createPersonMask = function (segment) {
        var data = segment.data, width = segment.width, height = segment.height;
        var segmentMaskData = new Uint8ClampedArray(width * height * 4);
        for (var i = 0; i < data.length; i++) {
            var m = i << 2;
            segmentMaskData[m] = segmentMaskData[m + 1] = segmentMaskData[m + 2] = segmentMaskData[m + 3] =
                data[i] * 255;
        }
        return new ImageData(segmentMaskData, width, height);
    };
    BackgroundProcessor._model = null;
    return BackgroundProcessor;
}(Processor_1.Processor));
exports.BackgroundProcessor = BackgroundProcessor;
//# sourceMappingURL=BackgroundProcessor.js.map
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
var Processor_1 = require("../Processor");
var Benchmark_1 = require("../../utils/Benchmark");
var constants_1 = require("../../constants");
/**
 * @private
 */
var BackgroundProcessor = /** @class */ (function (_super) {
    __extends(BackgroundProcessor, _super);
    function BackgroundProcessor(options) {
        var _this = _super.call(this) || this;
        _this._currentMask = new Uint8ClampedArray();
        _this._debounce = constants_1.DEBOUNCE;
        _this._historyCount = constants_1.HISTORY_COUNT;
        _this._inferenceConfig = constants_1.INFERENCE_CONFIG;
        _this._inferenceDimensions = constants_1.WASM_INFERENCE_DIMENSIONS;
        _this._inputMemoryOffset = 0;
        _this._maskBlurRadius = constants_1.MASK_BLUR_RADIUS;
        _this._maskUsageCounter = 0;
        _this._outputMemoryOffset = 0;
        _this._personProbabilityThreshold = constants_1.PERSON_PROBABILITY_THRESHOLD;
        if (typeof options.assetsPath !== 'string') {
            throw new Error('assetsPath parameter is missing');
        }
        var assetsPath = options.assetsPath;
        if (assetsPath && assetsPath[assetsPath.length - 1] !== '/') {
            assetsPath += '/';
        }
        _this.maskBlurRadius = options.maskBlurRadius;
        _this._assetsPath = assetsPath;
        _this._debounce = options.debounce || constants_1.DEBOUNCE;
        _this._historyCount = options.historyCount || constants_1.HISTORY_COUNT;
        _this._inferenceConfig = options.inferenceConfig || constants_1.INFERENCE_CONFIG;
        _this._personProbabilityThreshold = options.personProbabilityThreshold || constants_1.PERSON_PROBABILITY_THRESHOLD;
        _this._useWasm = typeof options.useWasm === 'boolean' ? options.useWasm : true;
        _this._inferenceDimensions = options.inferenceDimensions ||
            (_this._useWasm ? constants_1.WASM_INFERENCE_DIMENSIONS : constants_1.BODYPIX_INFERENCE_DIMENSIONS);
        _this._benchmark = new Benchmark_1.Benchmark();
        _this._inputCanvas = document.createElement('canvas');
        _this._inputContext = _this._inputCanvas.getContext('2d');
        _this._maskCanvas = new OffscreenCanvas(1, 1);
        _this._maskContext = _this._maskCanvas.getContext('2d');
        _this._outputCanvas = new OffscreenCanvas(1, 1);
        _this._outputContext = _this._outputCanvas.getContext('2d');
        _this._masks = [];
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
                console.warn("Valid mask blur radius not found. Using " + constants_1.MASK_BLUR_RADIUS + " as default.");
                radius = constants_1.MASK_BLUR_RADIUS;
            }
            this._maskBlurRadius = radius;
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
            var _a, tflite, modelResponse, model, modelBufferOffset;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, Promise.all([
                            BackgroundProcessor._loadModel(),
                            this._loadTwilioTfLite(),
                            fetch(this._assetsPath + constants_1.MODEL_NAME),
                        ])];
                    case 1:
                        _a = _b.sent(), tflite = _a[1], modelResponse = _a[2];
                        return [4 /*yield*/, modelResponse.arrayBuffer()];
                    case 2:
                        model = _b.sent();
                        modelBufferOffset = tflite._getModelBufferMemoryOffset();
                        tflite.HEAPU8.set(new Uint8Array(model), modelBufferOffset);
                        tflite._loadModel(model.byteLength);
                        this._inputMemoryOffset = tflite._getInputMemoryOffset() / 4;
                        this._outputMemoryOffset = tflite._getOutputMemoryOffset() / 4;
                        this._tflite = tflite;
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Apply a transform to the background of an input video frame and leaving
     * the foreground (person(s)) untouched. Any exception detected will
     * return a null value and will result in the frame being dropped.
     */
    BackgroundProcessor.prototype.processFrame = function (inputFrame) {
        return __awaiter(this, void 0, void 0, function () {
            var captureWidth, captureHeight, _a, inferenceWidth, inferenceHeight, imageData, personMask, segment;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!BackgroundProcessor._model || !this._tflite) {
                            return [2 /*return*/, inputFrame];
                        }
                        this._benchmark.end('processFrame(jsdk)');
                        this._benchmark.start('processFrame(processor)');
                        this._benchmark.start('resizeInputImage');
                        captureWidth = inputFrame.width, captureHeight = inputFrame.height;
                        _a = this._inferenceDimensions, inferenceWidth = _a.width, inferenceHeight = _a.height;
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
                        if (!this._useWasm) return [3 /*break*/, 1];
                        personMask = this._createWasmPersonMask(imageData);
                        return [3 /*break*/, 3];
                    case 1: return [4 /*yield*/, BackgroundProcessor._model.segmentPerson(imageData, this._inferenceConfig)];
                    case 2:
                        segment = _b.sent();
                        personMask = this._createBodyPixPersonMask(segment);
                        _b.label = 3;
                    case 3:
                        this._benchmark.end('segmentPerson');
                        this._benchmark.start('imageCompositing');
                        this._maskContext.putImageData(personMask, 0, 0);
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
    BackgroundProcessor.prototype._addMask = function (mask) {
        if (this._masks.length >= this._historyCount) {
            this._masks.splice(0, this._masks.length - this._historyCount + 1);
        }
        this._masks.push(mask);
    };
    BackgroundProcessor.prototype._applyAlpha = function (imageData) {
        var weightedSum = this._masks.reduce(function (sum, mask, j) { return sum + (j + 1) * (j + 1); }, 0);
        var pixels = imageData.height * imageData.width;
        var _loop_1 = function (i) {
            var w = this_1._masks.reduce(function (sum, mask, j) { return sum + mask[i] * (j + 1) * (j + 1); }, 0) / weightedSum;
            imageData.data[i * 4 + 3] = Math.round(w * 255);
        };
        var this_1 = this;
        for (var i = 0; i < pixels; i++) {
            _loop_1(i);
        }
    };
    BackgroundProcessor.prototype._createBodyPixPersonMask = function (segment) {
        var data = segment.data, width = segment.width, height = segment.height;
        var imageData = new ImageData(new Uint8ClampedArray(width * height * 4), width, height);
        this._addMask(data);
        this._applyAlpha(imageData);
        return imageData;
    };
    BackgroundProcessor.prototype._createWasmPersonMask = function (resizedInputFrame) {
        var _a = this, _b = _a._inferenceDimensions, width = _b.width, height = _b.height, tflite = _a._tflite;
        var pixels = width * height;
        if (this._maskUsageCounter < 1) {
            for (var i = 0; i < pixels; i++) {
                tflite.HEAPF32[this._inputMemoryOffset + i * 3] = resizedInputFrame.data[i * 4] / 255;
                tflite.HEAPF32[this._inputMemoryOffset + i * 3 + 1] = resizedInputFrame.data[i * 4 + 1] / 255;
                tflite.HEAPF32[this._inputMemoryOffset + i * 3 + 2] = resizedInputFrame.data[i * 4 + 2] / 255;
            }
            tflite._runInference();
            this._currentMask = new Uint8ClampedArray(pixels * 4);
            for (var i = 0; i < pixels; i++) {
                var personProbability = tflite.HEAPF32[this._outputMemoryOffset + i];
                this._currentMask[i] = Number(personProbability >= this._personProbabilityThreshold) * personProbability;
            }
            this._maskUsageCounter = this._debounce;
        }
        this._addMask(this._currentMask);
        this._applyAlpha(resizedInputFrame);
        this._maskUsageCounter--;
        return resizedInputFrame;
    };
    BackgroundProcessor.prototype._loadJs = function (url) {
        return new Promise(function (resolve, reject) {
            var script = document.createElement('script');
            script.onload = function () { return resolve(); };
            script.onerror = reject;
            document.head.append(script);
            script.src = url;
        });
    };
    BackgroundProcessor.prototype._loadTwilioTfLite = function () {
        return __awaiter(this, void 0, void 0, function () {
            var tflite, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this._loadJs(this._assetsPath + constants_1.TFLITE_LOADER_NAME_SIMD)];
                    case 1:
                        _b.sent();
                        _b.label = 2;
                    case 2:
                        _b.trys.push([2, 4, , 7]);
                        return [4 /*yield*/, window.createTwilioTFLiteSIMDModule()];
                    case 3:
                        tflite = _b.sent();
                        return [3 /*break*/, 7];
                    case 4:
                        _a = _b.sent();
                        console.warn('SIMD not supported. You may experience poor quality of background replacement.');
                        return [4 /*yield*/, this._loadJs(this._assetsPath + constants_1.TFLITE_LOADER_NAME)];
                    case 5:
                        _b.sent();
                        return [4 /*yield*/, window.createTwilioTFLiteModule()];
                    case 6:
                        tflite = _b.sent();
                        return [3 /*break*/, 7];
                    case 7: return [2 /*return*/, tflite];
                }
            });
        });
    };
    BackgroundProcessor._model = null;
    return BackgroundProcessor;
}(Processor_1.Processor));
exports.BackgroundProcessor = BackgroundProcessor;
//# sourceMappingURL=BackgroundProcessor.js.map
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
//# sourceMappingURL=TwilioTFLite.js.map
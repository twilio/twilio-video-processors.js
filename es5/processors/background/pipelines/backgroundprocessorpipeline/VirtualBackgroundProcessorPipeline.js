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
//# sourceMappingURL=VirtualBackgroundProcessorPipeline.js.map
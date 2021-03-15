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
var BackgroundProcessor_1 = require("./BackgroundProcessor");
var types_1 = require("../../types");
var VirtualBackgroundProcessor = /** @class */ (function (_super) {
    __extends(VirtualBackgroundProcessor, _super);
    function VirtualBackgroundProcessor(options) {
        var _this = _super.call(this, options) || this;
        _this.backgroundImage = options.backgroundImage;
        _this.fitType = options.fitType;
        return _this;
    }
    Object.defineProperty(VirtualBackgroundProcessor.prototype, "backgroundImage", {
        get: function () {
            return this._backgroundImage;
        },
        set: function (image) {
            if (!image || !image.complete || !image.naturalHeight) {
                throw new Error('Invalid image. Make sure that the image is an HTMLImageElement and has been successfully loaded');
            }
            this._backgroundImage = image;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(VirtualBackgroundProcessor.prototype, "fitType", {
        get: function () {
            return this._fitType;
        },
        set: function (fitType) {
            var validTypes = Object.keys(types_1.ImageFit);
            if (!validTypes.includes(fitType)) {
                console.warn("Valid fitType not found. Using '" + types_1.ImageFit.Fill + "' as default.");
                fitType = types_1.ImageFit.Fill;
            }
            this._fitType = fitType;
        },
        enumerable: false,
        configurable: true
    });
    VirtualBackgroundProcessor.prototype._setBackground = function () {
        var img = this._backgroundImage;
        var imageWidth = img.naturalWidth;
        var imageHeight = img.naturalHeight;
        var canvasWidth = this._outputCanvas.width;
        var canvasHeight = this._outputCanvas.height;
        if (this._fitType === types_1.ImageFit.Fill) {
            this._outputContext.drawImage(img, 0, 0, imageWidth, imageHeight, 0, 0, canvasWidth, canvasHeight);
        }
        else if (this._fitType === types_1.ImageFit.None) {
            this._outputContext.drawImage(img, 0, 0, imageWidth, imageHeight);
        }
        else if (this._fitType === types_1.ImageFit.Contain) {
            var _a = this._getFitPosition(imageWidth, imageHeight, canvasWidth, canvasHeight, types_1.ImageFit.Contain), x = _a.x, y = _a.y, w = _a.w, h = _a.h;
            this._outputContext.drawImage(img, 0, 0, imageWidth, imageHeight, x, y, w, h);
        }
        else if (this._fitType === types_1.ImageFit.Cover) {
            var _b = this._getFitPosition(imageWidth, imageHeight, canvasWidth, canvasHeight, types_1.ImageFit.Cover), x = _b.x, y = _b.y, w = _b.w, h = _b.h;
            this._outputContext.drawImage(img, 0, 0, imageWidth, imageHeight, x, y, w, h);
        }
    };
    VirtualBackgroundProcessor.prototype._getFitPosition = function (contentWidth, contentHeight, viewportWidth, viewportHeight, type) {
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
            x: x, y: y,
            w: newContentWidth,
            h: newContentHeight,
        };
    };
    return VirtualBackgroundProcessor;
}(BackgroundProcessor_1.BackgroundProcessor));
exports.VirtualBackgroundProcessor = VirtualBackgroundProcessor;
//# sourceMappingURL=VirtualBackgroundProcessor.js.map
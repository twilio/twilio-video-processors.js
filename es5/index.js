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
exports.VirtualBackgroundProcessor = exports.Processor = exports.ImageFit = exports.GrayscaleProcessor = exports.GaussianBlurBackgroundProcessor = exports.BackgroundProcessor = void 0;
var BackgroundProcessor_1 = require("./processors/background/BackgroundProcessor");
Object.defineProperty(exports, "BackgroundProcessor", { enumerable: true, get: function () { return BackgroundProcessor_1.BackgroundProcessor; } });
var GaussianBlurBackgroundProcessor_1 = require("./processors/background/GaussianBlurBackgroundProcessor");
Object.defineProperty(exports, "GaussianBlurBackgroundProcessor", { enumerable: true, get: function () { return GaussianBlurBackgroundProcessor_1.GaussianBlurBackgroundProcessor; } });
var VirtualBackgroundProcessor_1 = require("./processors/background/VirtualBackgroundProcessor");
Object.defineProperty(exports, "VirtualBackgroundProcessor", { enumerable: true, get: function () { return VirtualBackgroundProcessor_1.VirtualBackgroundProcessor; } });
var grayscale_1 = require("./processors/grayscale");
Object.defineProperty(exports, "GrayscaleProcessor", { enumerable: true, get: function () { return grayscale_1.GrayscaleProcessor; } });
var Processor_1 = require("./processors/Processor");
Object.defineProperty(exports, "Processor", { enumerable: true, get: function () { return Processor_1.Processor; } });
var types_1 = require("./types");
Object.defineProperty(exports, "ImageFit", { enumerable: true, get: function () { return types_1.ImageFit; } });
window.Twilio = window.Twilio || {};
window.Twilio.VideoProcessors = __assign(__assign({}, window.Twilio.VideoProcessors), { GaussianBlurBackgroundProcessor: GaussianBlurBackgroundProcessor_1.GaussianBlurBackgroundProcessor,
    GrayscaleProcessor: grayscale_1.GrayscaleProcessor,
    ImageFit: types_1.ImageFit,
    VirtualBackgroundProcessor: VirtualBackgroundProcessor_1.VirtualBackgroundProcessor });
//# sourceMappingURL=index.js.map
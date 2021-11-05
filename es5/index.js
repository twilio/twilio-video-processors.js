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
    window.Twilio.VideoProcessors = __assign(__assign({}, window.Twilio.VideoProcessors), { GaussianBlurBackgroundProcessor: GaussianBlurBackgroundProcessor_1.GaussianBlurBackgroundProcessor,
        ImageFit: types_1.ImageFit,
        isSupported: support_1.isSupported,
        version: version_1.version,
        VirtualBackgroundProcessor: VirtualBackgroundProcessor_1.VirtualBackgroundProcessor });
}
//# sourceMappingURL=index.js.map
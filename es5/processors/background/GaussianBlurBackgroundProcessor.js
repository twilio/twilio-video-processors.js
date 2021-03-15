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
exports.GaussianBlurBackgroundProcessor = void 0;
var BackgroundProcessor_1 = require("./BackgroundProcessor");
var constants_1 = require("../../constants");
var GaussianBlurBackgroundProcessor = /** @class */ (function (_super) {
    __extends(GaussianBlurBackgroundProcessor, _super);
    function GaussianBlurBackgroundProcessor(options) {
        var _this = _super.call(this, options) || this;
        _this._blurFilterRadius = constants_1.DEFAULT_BLUR_FILTER_RADIUS;
        _this.blurFilterRadius = options === null || options === void 0 ? void 0 : options.blurFilterRadius;
        return _this;
    }
    Object.defineProperty(GaussianBlurBackgroundProcessor.prototype, "blurFilterRadius", {
        get: function () {
            return this._blurFilterRadius;
        },
        set: function (radius) {
            if (!radius) {
                console.warn("Valid blur filter radius not found. Using " + constants_1.DEFAULT_BLUR_FILTER_RADIUS + " as default.");
                radius = constants_1.DEFAULT_BLUR_FILTER_RADIUS;
            }
            this._blurFilterRadius = radius;
        },
        enumerable: false,
        configurable: true
    });
    GaussianBlurBackgroundProcessor.prototype._setBackground = function (inputFrame) {
        this._outputContext.filter = "blur(" + this._blurFilterRadius + "px)";
        this._outputContext.drawImage(inputFrame, 0, 0);
    };
    return GaussianBlurBackgroundProcessor;
}(BackgroundProcessor_1.BackgroundProcessor));
exports.GaussianBlurBackgroundProcessor = GaussianBlurBackgroundProcessor;
//# sourceMappingURL=GaussianBlurBackgroundProcessor.js.map
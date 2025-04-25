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
exports.GaussianBlurFilterPipeline = void 0;
var pipelines_1 = require("../../../pipelines");
var SinglePassGaussianBlurFilterStage_1 = require("./SinglePassGaussianBlurFilterStage");
/**
 * @private
 */
var GaussianBlurFilterPipeline = /** @class */ (function (_super) {
    __extends(GaussianBlurFilterPipeline, _super);
    function GaussianBlurFilterPipeline(outputCanvas, blurFilterRadius) {
        var _this = _super.call(this) || this;
        _this._isWebGL2Supported = true;
        _this._outputCanvas = outputCanvas;
        _this._blurFilterRadius = blurFilterRadius;
        var glOut = outputCanvas.getContext('webgl2');
        if (glOut) {
            _this.initializeWebGL2Pipeline(glOut);
        }
        else {
            _this._isWebGL2Supported = false;
            console.warn('Downgraded to Canvas2D for Gaussian blur due to missing WebGL2 support.');
        }
        return _this;
    }
    GaussianBlurFilterPipeline.prototype.render = function () {
        if (!this._isWebGL2Supported) {
            this._renderFallback();
        }
        else {
            _super.prototype.render.call(this);
        }
    };
    GaussianBlurFilterPipeline.prototype._renderFallback = function () {
        var ctx = this._outputCanvas.getContext('2d');
        ctx.filter = "blur(".concat(this._blurFilterRadius, "px)");
    };
    GaussianBlurFilterPipeline.prototype.initializeWebGL2Pipeline = function (glOut) {
        this.addStage(new SinglePassGaussianBlurFilterStage_1.SinglePassGaussianBlurFilterStage(glOut, 'horizontal', 'texture', 0, 2));
        this.addStage(new SinglePassGaussianBlurFilterStage_1.SinglePassGaussianBlurFilterStage(glOut, 'vertical', 'canvas', 2));
    };
    GaussianBlurFilterPipeline.prototype.updateRadius = function (radius) {
        this._blurFilterRadius = radius;
        if (!this._isWebGL2Supported) {
            // SinglePassGaussianBlurFilterStage is not supported in Canvas2D fallback
            return;
        }
        this._stages.forEach(function (stage) { return stage
            .updateRadius(radius); });
    };
    GaussianBlurFilterPipeline.prototype.cleanUp = function () {
        if (this._isWebGL2Supported) {
            _super.prototype.cleanUp.call(this);
        }
    };
    return GaussianBlurFilterPipeline;
}(pipelines_1.WebGL2Pipeline));
exports.GaussianBlurFilterPipeline = GaussianBlurFilterPipeline;
//# sourceMappingURL=index.js.map
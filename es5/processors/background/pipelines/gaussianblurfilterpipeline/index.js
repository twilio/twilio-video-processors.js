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
    function GaussianBlurFilterPipeline(outputCanvas) {
        var _this = _super.call(this) || this;
        var glOut = outputCanvas.getContext('webgl2');
        _this.addStage(new SinglePassGaussianBlurFilterStage_1.SinglePassGaussianBlurFilterStage(glOut, 'horizontal', 'texture', 0, 2));
        _this.addStage(new SinglePassGaussianBlurFilterStage_1.SinglePassGaussianBlurFilterStage(glOut, 'vertical', 'canvas', 2));
        return _this;
    }
    GaussianBlurFilterPipeline.prototype.updateRadius = function (radius) {
        this._stages.forEach(function (stage) { return stage
            .updateRadius(radius); });
    };
    return GaussianBlurFilterPipeline;
}(pipelines_1.WebGL2Pipeline));
exports.GaussianBlurFilterPipeline = GaussianBlurFilterPipeline;
//# sourceMappingURL=index.js.map
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
exports.PersonMaskUpscalePipeline = void 0;
var pipelines_1 = require("../../../pipelines");
var SinglePassBilateralFilterStage_1 = require("./SinglePassBilateralFilterStage");
/**
 * @private
 */
var PersonMaskUpscalePipeline = /** @class */ (function (_super) {
    __extends(PersonMaskUpscalePipeline, _super);
    function PersonMaskUpscalePipeline(inputDimensions, outputCanvas) {
        var _this = _super.call(this) || this;
        var glOut = outputCanvas.getContext('webgl2');
        var outputDimensions = {
            height: outputCanvas.height,
            width: outputCanvas.width
        };
        _this.addStage(new pipelines_1.WebGL2Pipeline.InputStage(glOut));
        _this.addStage(new SinglePassBilateralFilterStage_1.SinglePassBilateralFilterStage(glOut, 'horizontal', 'texture', inputDimensions, outputDimensions, 1, 2));
        _this.addStage(new SinglePassBilateralFilterStage_1.SinglePassBilateralFilterStage(glOut, 'vertical', 'canvas', inputDimensions, outputDimensions, 2));
        return _this;
    }
    PersonMaskUpscalePipeline.prototype.updateBilateralFilterConfig = function (config) {
        var _a = this._stages, bilateralFilterStages = _a.slice(1);
        var sigmaSpace = config.sigmaSpace;
        if (typeof sigmaSpace === 'number') {
            bilateralFilterStages.forEach(function (stage) {
                stage.updateSigmaColor(0.1);
                stage.updateSigmaSpace(sigmaSpace);
            });
        }
    };
    return PersonMaskUpscalePipeline;
}(pipelines_1.WebGL2Pipeline));
exports.PersonMaskUpscalePipeline = PersonMaskUpscalePipeline;
//# sourceMappingURL=index.js.map
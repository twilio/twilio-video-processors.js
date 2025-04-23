"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostProcessingStage = void 0;
var personmaskupscalepipeline_1 = require("../personmaskupscalepipeline");
/**
 * @private
 */
var PostProcessingStage = /** @class */ (function () {
    function PostProcessingStage(inputDimensions, webgl2Canvas, outputCanvas, maskBlurRadius, setBackground) {
        this._personMaskUpscalePipeline = null;
        this._inputDimensions = inputDimensions;
        this._maskBlurRadius = maskBlurRadius;
        this._outputContext = outputCanvas.getContext('2d');
        this._webgl2Canvas = webgl2Canvas;
        this._setBackground = setBackground;
    }
    PostProcessingStage.prototype.render = function (inputFrame, personMask) {
        var _a = this, _outputContext = _a._outputContext, _setBackground = _a._setBackground, _webgl2Canvas = _a._webgl2Canvas;
        if (!this._personMaskUpscalePipeline) {
            this.resetPersonMaskUpscalePipeline();
        }
        this._personMaskUpscalePipeline.render(inputFrame, personMask);
        _outputContext.save();
        _outputContext.globalCompositeOperation = 'copy';
        _outputContext.drawImage(_webgl2Canvas, 0, 0);
        _outputContext.globalCompositeOperation = 'destination-over';
        _setBackground(inputFrame);
        _outputContext.restore();
    };
    PostProcessingStage.prototype.resetPersonMaskUpscalePipeline = function () {
        var _a;
        var _b = this, _inputDimensions = _b._inputDimensions, _maskBlurRadius = _b._maskBlurRadius, _webgl2Canvas = _b._webgl2Canvas;
        (_a = this._personMaskUpscalePipeline) === null || _a === void 0 ? void 0 : _a.cleanUp();
        this._personMaskUpscalePipeline = new personmaskupscalepipeline_1.PersonMaskUpscalePipeline(_inputDimensions, _webgl2Canvas, _maskBlurRadius);
        this._personMaskUpscalePipeline.updateBilateralFilterConfig({
            sigmaSpace: _maskBlurRadius
        });
    };
    PostProcessingStage.prototype.updateMaskBlurRadius = function (radius) {
        var _a;
        if (this._maskBlurRadius !== radius) {
            this._maskBlurRadius = radius;
            (_a = this._personMaskUpscalePipeline) === null || _a === void 0 ? void 0 : _a.updateBilateralFilterConfig({
                sigmaSpace: radius
            });
        }
    };
    return PostProcessingStage;
}());
exports.PostProcessingStage = PostProcessingStage;
//# sourceMappingURL=PostProcessingStage.js.map
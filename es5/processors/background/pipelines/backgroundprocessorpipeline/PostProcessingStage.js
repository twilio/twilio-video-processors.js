"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostProcessingStage = void 0;
var constants_1 = require("../../../../constants");
var personmaskupscalepipeline_1 = require("../personmaskupscalepipeline");
/**
 * @private
 */
var PostProcessingStage = /** @class */ (function () {
    function PostProcessingStage(inputDimensions, webgl2Canvas, outputCanvas, maskBlurRadius, setBackground, hysteresis) {
        if (hysteresis === void 0) { hysteresis = { high: constants_1.HYSTERESIS_HIGH, low: constants_1.HYSTERESIS_LOW }; }
        this._personMaskUpscalePipeline = null;
        this._prevMaskData = null;
        this._hysteresisEnabled = hysteresis !== false;
        this._hysteresisHigh = hysteresis ? hysteresis.high : constants_1.HYSTERESIS_HIGH;
        this._hysteresisLow = hysteresis ? hysteresis.low : constants_1.HYSTERESIS_LOW;
        this._inputDimensions = inputDimensions;
        this._maskBlurRadius = maskBlurRadius;
        this._outputContext = outputCanvas.getContext('2d');
        this._webgl2Canvas = webgl2Canvas;
        this._setBackground = setBackground;
    }
    PostProcessingStage.prototype.render = function (inputFrame, personMask) {
        var _a = this, _outputContext = _a._outputContext, _setBackground = _a._setBackground, _webgl2Canvas = _a._webgl2Canvas;
        if (this._hysteresisEnabled) {
            this._applyHysteresis(personMask);
        }
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
    PostProcessingStage.prototype.updateHysteresis = function (config) {
        if (config === false) {
            this._hysteresisEnabled = false;
            this._prevMaskData = null;
        }
        else {
            var thresholdsChanged = this._hysteresisHigh !== config.high
                || this._hysteresisLow !== config.low;
            this._hysteresisEnabled = true;
            this._hysteresisHigh = config.high;
            this._hysteresisLow = config.low;
            if (thresholdsChanged) {
                this._prevMaskData = null;
            }
        }
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
    PostProcessingStage.prototype._applyHysteresis = function (personMask) {
        var _a;
        var data = personMask.data;
        var _b = this, _hysteresisHigh = _b._hysteresisHigh, _hysteresisLow = _b._hysteresisLow;
        var pixelCount = data.length / 4;
        var hasPrev = ((_a = this._prevMaskData) === null || _a === void 0 ? void 0 : _a.length) === pixelCount;
        if (!hasPrev) {
            this._prevMaskData = new Uint8ClampedArray(pixelCount);
        }
        var prevMask = this._prevMaskData;
        for (var i = 3, j = 0; i < data.length; i += 4, j++) {
            if (data[i] >= _hysteresisHigh) {
                data[i] = 255;
            }
            else if (data[i] <= _hysteresisLow) {
                data[i] = 0;
            }
            else if (hasPrev) {
                data[i] = prevMask[j];
            }
            prevMask[j] = data[i];
        }
    };
    return PostProcessingStage;
}());
exports.PostProcessingStage = PostProcessingStage;
//# sourceMappingURL=PostProcessingStage.js.map
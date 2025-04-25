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
    function PersonMaskUpscalePipeline(inputDimensions, outputCanvas, maskBlurRadius) {
        var _this = _super.call(this) || this;
        _this._isWebGL2Supported = true;
        _this._outputCanvas = outputCanvas;
        _this._inputDimensions = inputDimensions;
        _this._maskBlurRadius = maskBlurRadius;
        var glOut = outputCanvas.getContext('webgl2');
        if (glOut) {
            _this.initializeWebGL2Pipeline(glOut);
        }
        else {
            _this._isWebGL2Supported = false;
            console.warn('Downgraded to Canvas2D for person mask upscaling due to missing WebGL2 support.');
        }
        return _this;
    }
    PersonMaskUpscalePipeline.prototype.initializeWebGL2Pipeline = function (glOut) {
        var outputDimensions = {
            height: this._outputCanvas.height,
            width: this._outputCanvas.width
        };
        this.addStage(new pipelines_1.WebGL2Pipeline.InputStage(glOut));
        this.addStage(new SinglePassBilateralFilterStage_1.SinglePassBilateralFilterStage(glOut, 'horizontal', 'texture', this._inputDimensions, outputDimensions, 1, 2));
        this.addStage(new SinglePassBilateralFilterStage_1.SinglePassBilateralFilterStage(glOut, 'vertical', 'canvas', this._inputDimensions, outputDimensions, 2));
    };
    PersonMaskUpscalePipeline.prototype.render = function (inputFrame, personMask) {
        if (this._isWebGL2Supported) {
            // Use WebGL2 pipeline when supported
            _super.prototype.render.call(this, inputFrame, personMask);
        }
        else {
            // Fallback for browsers without WebGL2 support
            this._renderFallback(inputFrame, personMask);
        }
    };
    /**
     * Render the person mask using a Canvas 2D context as a fallback for browsers without WebGL2 support
     * @param inputFrame - The input frame to render
     * @param personMask - The person mask to render
     */
    PersonMaskUpscalePipeline.prototype._renderFallback = function (inputFrame, personMask) {
        // Create a temporary canvas for the mask
        var maskCanvas = new OffscreenCanvas(personMask.width, personMask.height);
        var maskCtx = maskCanvas.getContext('2d');
        maskCtx.putImageData(personMask, 0, 0);
        // Get 2D context for drawing
        var ctx = this._outputCanvas.getContext('2d');
        ctx.save();
        ctx.filter = "blur(".concat(this._maskBlurRadius, "px)");
        ctx.globalCompositeOperation = 'copy';
        ctx.drawImage(maskCanvas, 0, 0, this._outputCanvas.width, this._outputCanvas.height);
        ctx.filter = 'none';
        ctx.globalCompositeOperation = 'source-in';
        ctx.drawImage(inputFrame, 0, 0, this._outputCanvas.width, this._outputCanvas.height);
        ctx.restore();
    };
    PersonMaskUpscalePipeline.prototype.updateBilateralFilterConfig = function (config) {
        var sigmaSpace = config.sigmaSpace;
        if (typeof sigmaSpace !== 'number') {
            return;
        }
        if (!this._isWebGL2Supported) {
            this._maskBlurRadius = sigmaSpace;
            // SinglePassBilateralFilterStage is not supported in Canvas2D fallback
            return;
        }
        var _a = this._stages, bilateralFilterStages = _a.slice(1);
        bilateralFilterStages.forEach(function (stage) {
            stage.updateSigmaColor(0.1);
            stage.updateSigmaSpace(sigmaSpace);
        });
    };
    PersonMaskUpscalePipeline.prototype.cleanUp = function () {
        if (this._isWebGL2Supported) {
            _super.prototype.cleanUp.call(this);
        }
    };
    return PersonMaskUpscalePipeline;
}(pipelines_1.WebGL2Pipeline));
exports.PersonMaskUpscalePipeline = PersonMaskUpscalePipeline;
//# sourceMappingURL=index.js.map
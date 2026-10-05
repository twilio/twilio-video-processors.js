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
exports.SinglePassBilateralFilterStage = void 0;
var pipelines_1 = require("../../../pipelines");
// Stands in for -Infinity at sigma 0, so only taps at zero distance keep any
// weight. Must stay float32-representable: uniform1f would turn anything larger
// into -Infinity, and x * x * -Infinity is NaN or 0 depending on the driver.
var SIGMA_ZERO_COEFFICIENT = -1e30;
/**
 * @private
 * Gaussian x^2 coefficient, -0.5 / sigma^2.
 */
function negInvTwoSigmaSq(sigma) {
    return sigma > 0
        ? -0.5 / (sigma * sigma)
        : SIGMA_ZERO_COEFFICIENT;
}
/**
 * @private
 */
var SinglePassBilateralFilterStage = /** @class */ (function (_super) {
    __extends(SinglePassBilateralFilterStage, _super);
    function SinglePassBilateralFilterStage(glOut, direction, outputType, inputDimensions, outputDimensions, inputTextureUnit, outputTextureUnit) {
        var _this = this;
        if (outputTextureUnit === void 0) { outputTextureUnit = inputTextureUnit + 1; }
        var height = outputDimensions.height, width = outputDimensions.width;
        _this = _super.call(this, {
            textureName: 'u_segmentationMask',
            textureUnit: inputTextureUnit
        }, {
            fragmentShaderSource: "#version 300 es\n          precision highp float;\n\n          uniform sampler2D u_inputFrame;\n          uniform sampler2D u_segmentationMask;\n          uniform vec2 u_texelSize;\n          uniform float u_direction;\n          uniform float u_radius;\n          uniform float u_step;\n          // -0.5 / sigma^2, so a tap costs one exp() and no division.\n          uniform float u_negInvTwoSigmaSqColor;\n          uniform float u_negInvTwoSigmaSqTexel;\n\n          in vec2 v_texCoord;\n\n          out vec4 outColor;\n\n          float calculateColorWeight(vec2 coord, vec3 centerColor) {\n            vec3 coordColor = texture(u_inputFrame, coord).rgb;\n            float x = distance(centerColor, coordColor);\n            return exp(x * x * u_negInvTwoSigmaSqColor);\n          }\n\n          float calculateSpaceWeight(float i) {\n            // x along a horizontal pass, y along a vertical one.\n            float texelStep = mix(u_texelSize.x, u_texelSize.y, u_direction);\n            float x = i * texelStep;\n            return exp(x * x * u_negInvTwoSigmaSqTexel);\n          }\n\n          float edgePixelsAverageAlpha(float outAlpha) {\n            float totalAlpha = outAlpha;\n            float totalPixels = 1.0;\n\n            for (float i = -u_radius; u_radius > 0.0 && i <= u_radius; i += u_radius) {\n              for (float j = -u_radius; j <= u_radius; j += u_radius * (j == 0.0 ? 2.0 : 1.0)) {\n                vec2 shift = vec2(i, j) * u_texelSize;\n                vec2 coord = vec2(v_texCoord + shift);\n                totalAlpha += texture(u_segmentationMask, coord).a;\n                totalPixels++;\n              }\n            }\n\n            return totalAlpha / totalPixels;\n          }\n\n          void main() {\n            vec3 centerColor = texture(u_inputFrame, v_texCoord).rgb;\n            float outAlpha = texture(u_segmentationMask, v_texCoord).a;\n            float averageAlpha = edgePixelsAverageAlpha(outAlpha);\n            float totalWeight = 1.0;\n\n            if (averageAlpha == 0.0 || averageAlpha == 1.0) {\n              outColor = vec4(averageAlpha * centerColor, averageAlpha);\n              return;\n            }\n\n            for (float i = 1.0; i <= u_radius; i += u_step) {\n              float x = (1.0 - u_direction) * i;\n              float y = u_direction * i;\n              vec2 shift = vec2(x, y) * u_texelSize;\n              vec2 coord = vec2(v_texCoord + shift);\n              float spaceWeight = calculateSpaceWeight(i);\n              float colorWeight = calculateColorWeight(coord, centerColor);\n              float weight = spaceWeight * colorWeight;\n              float alpha = texture(u_segmentationMask, coord).a;\n              totalWeight += weight;\n              outAlpha += weight * alpha;\n\n              shift = vec2(-x, -y) * u_texelSize;\n              coord = vec2(v_texCoord + shift);\n              colorWeight = calculateColorWeight(coord, centerColor);\n              weight = spaceWeight * colorWeight;\n              alpha = texture(u_segmentationMask, coord).a;\n              totalWeight += weight;\n              outAlpha += weight * alpha;\n            }\n\n            outAlpha /= totalWeight;\n            outColor = vec4(outAlpha * centerColor, outAlpha);\n          }\n        ",
            glOut: glOut,
            height: height,
            textureUnit: outputTextureUnit,
            type: outputType,
            width: width,
            uniformVars: [
                {
                    name: 'u_inputFrame',
                    type: 'int',
                    values: [0]
                },
                {
                    name: 'u_direction',
                    type: 'float',
                    values: [direction === 'vertical' ? 1 : 0]
                },
                {
                    name: 'u_texelSize',
                    type: 'float',
                    values: [1 / width, 1 / height]
                }
            ]
        }) || this;
        _this._inputDimensions = inputDimensions;
        _this.updateSigmaColor(0);
        _this.updateSigmaSpace(0);
        return _this;
    }
    SinglePassBilateralFilterStage.prototype.updateSigmaColor = function (sigmaColor) {
        this._setUniformVars([
            {
                name: 'u_negInvTwoSigmaSqColor',
                type: 'float',
                values: [negInvTwoSigmaSq(sigmaColor)]
            }
        ]);
    };
    SinglePassBilateralFilterStage.prototype.updateSigmaSpace = function (sigmaSpace) {
        var _a = this._inputDimensions, inputHeight = _a.height, inputWidth = _a.width;
        var _b = this._outputDimensions, outputHeight = _b.height, outputWidth = _b.width;
        sigmaSpace *= Math.max(outputWidth / inputWidth, outputHeight / inputHeight);
        var step = Math.floor(0.5 * sigmaSpace / Math.log(sigmaSpace));
        var sigmaTexel = Math.max(1 / outputWidth, 1 / outputHeight) * sigmaSpace;
        this._setUniformVars([
            {
                name: 'u_radius',
                type: 'float',
                values: [sigmaSpace]
            },
            {
                name: 'u_negInvTwoSigmaSqTexel',
                type: 'float',
                values: [negInvTwoSigmaSq(sigmaTexel)]
            },
            {
                name: 'u_step',
                type: 'float',
                values: [step]
            }
        ]);
    };
    return SinglePassBilateralFilterStage;
}(pipelines_1.WebGL2Pipeline.ProcessingStage));
exports.SinglePassBilateralFilterStage = SinglePassBilateralFilterStage;
//# sourceMappingURL=SinglePassBilateralFilterStage.js.map
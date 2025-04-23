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
exports.SinglePassGaussianBlurFilterStage = void 0;
var pipelines_1 = require("../../../pipelines");
/**
 * @private
 */
function createGaussianBlurWeights(radius) {
    var coeff = 1.0 / Math.sqrt(2.0 * Math.PI) / radius;
    return '0'.repeat(radius + 1).split('').map(function (zero, x) {
        return coeff * Math.exp(-0.5 * x * x / radius / radius);
    });
}
/**
 * @private
 */
var SinglePassGaussianBlurFilterStage = /** @class */ (function (_super) {
    __extends(SinglePassGaussianBlurFilterStage, _super);
    function SinglePassGaussianBlurFilterStage(glOut, direction, outputType, inputTextureUnit, outputTextureUnit) {
        var _this = this;
        if (outputTextureUnit === void 0) { outputTextureUnit = inputTextureUnit + 1; }
        var _a = glOut.canvas, height = _a.height, width = _a.width;
        _this = _super.call(this, {
            textureName: 'u_inputTexture',
            textureUnit: inputTextureUnit
        }, {
            fragmentShaderSource: "#version 300 es\n          precision highp float;\n\n          uniform sampler2D u_inputTexture;\n          uniform vec2 u_texelSize;\n          uniform float u_direction;\n          uniform float u_radius;\n          uniform float u_gaussianBlurWeights[128];\n\n          in vec2 v_texCoord;\n\n          out vec4 outColor;\n\n          void main() {\n            float totalWeight = u_gaussianBlurWeights[0];\n            vec3 newColor = totalWeight * texture(u_inputTexture, v_texCoord).rgb;\n\n            for (float i = 1.0; i <= u_radius; i += 1.0) {\n              float x = (1.0 - u_direction) * i;\n              float y = u_direction * i;\n\n              vec2 shift = vec2(x, y) * u_texelSize;\n              vec2 coord = vec2(v_texCoord + shift);\n              float weight = u_gaussianBlurWeights[int(i)];\n              newColor += weight * texture(u_inputTexture, coord).rgb;\n              totalWeight += weight;\n\n              shift = vec2(-x, -y) * u_texelSize;\n              coord = vec2(v_texCoord + shift);\n              newColor += weight * texture(u_inputTexture, coord).rgb;\n              totalWeight += weight;\n            }\n\n            newColor /= totalWeight;\n            outColor = vec4(newColor, 1.0);\n          }\n        ",
            glOut: glOut,
            height: height,
            textureUnit: outputTextureUnit,
            type: outputType,
            width: width,
            uniformVars: [
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
        _this.updateRadius(0);
        return _this;
    }
    SinglePassGaussianBlurFilterStage.prototype.updateRadius = function (radius) {
        this._setUniformVars([
            {
                name: 'u_radius',
                type: 'float',
                values: [radius]
            },
            {
                name: 'u_gaussianBlurWeights',
                type: 'float:v',
                values: createGaussianBlurWeights(radius)
            }
        ]);
    };
    return SinglePassGaussianBlurFilterStage;
}(pipelines_1.WebGL2Pipeline.ProcessingStage));
exports.SinglePassGaussianBlurFilterStage = SinglePassGaussianBlurFilterStage;
//# sourceMappingURL=SinglePassGaussianBlurFilterStage.js.map
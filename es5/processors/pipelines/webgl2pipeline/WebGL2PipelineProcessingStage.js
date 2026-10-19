"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebGL2PipelineProcessingStage = void 0;
var webgl2PipelineHelpers_1 = require("./webgl2PipelineHelpers");
/**;
 * @private
 */
var WebGL2PipelineProcessingStage = /** @class */ (function () {
    function WebGL2PipelineProcessingStage(inputConfig, outputConfig) {
        this._outputFramebuffer = null;
        this._outputTexture = null;
        var textureName = inputConfig.textureName, textureUnit = inputConfig.textureUnit;
        var glOut = outputConfig.glOut;
        this._glOut = glOut;
        var fragmentShaderSource = outputConfig.fragmentShaderSource, _a = outputConfig.height, height = _a === void 0 ? glOut.canvas.height : _a, _b = outputConfig.textureUnit, outputTextureUnit = _b === void 0 ? textureUnit + 1 : _b, outputType = outputConfig.type, _c = outputConfig.uniformVars, uniformVars = _c === void 0 ? [] : _c, _d = outputConfig.vertexShaderSource, vertexShaderSource = _d === void 0 ? "#version 300 es\n        in vec2 a_position;\n        in vec2 a_texCoord;\n\n        out vec2 v_texCoord;\n\n        void main() {\n          gl_Position = vec4(a_position".concat(outputType === 'canvas'
            ? ' * vec2(1.0, -1.0)'
            : '', ", 0.0, 1.0);\n          v_texCoord = a_texCoord;\n        }\n      ") : _d, _e = outputConfig.width, width = _e === void 0 ? glOut.canvas.width : _e;
        this._outputDimensions = {
            height: height,
            width: width
        };
        this._outputTextureUnit = outputTextureUnit;
        this._fragmentShader = (0, webgl2PipelineHelpers_1.compileShader)(glOut, glOut.FRAGMENT_SHADER, fragmentShaderSource);
        this._vertexShader = (0, webgl2PipelineHelpers_1.compileShader)(glOut, glOut.VERTEX_SHADER, vertexShaderSource);
        this._positionBuffer = (0, webgl2PipelineHelpers_1.initBuffer)(glOut, [
            -1.0, -1.0,
            1.0, -1.0,
            -1.0, 1.0,
            1.0, 1.0,
        ]);
        this._texCoordBuffer = (0, webgl2PipelineHelpers_1.initBuffer)(glOut, [
            0.0, 0.0,
            1.0, 0.0,
            0.0, 1.0,
            1.0, 1.0,
        ]);
        if (outputType === 'texture') {
            this._outputTexture = (0, webgl2PipelineHelpers_1.createTexture)(glOut, glOut.RGBA8, width, height);
            this._outputFramebuffer = glOut.createFramebuffer();
            glOut.bindFramebuffer(glOut.FRAMEBUFFER, this._outputFramebuffer);
            glOut.framebufferTexture2D(glOut.FRAMEBUFFER, glOut.COLOR_ATTACHMENT0, glOut.TEXTURE_2D, this._outputTexture, 0);
        }
        var program = (0, webgl2PipelineHelpers_1.createPipelineStageProgram)(glOut, this._vertexShader, this._fragmentShader, this._positionBuffer, this._texCoordBuffer);
        this._program = program;
        this._setUniformVars(__spreadArray([
            {
                name: textureName,
                type: 'int',
                values: [textureUnit]
            }
        ], uniformVars, true));
    }
    WebGL2PipelineProcessingStage.prototype.cleanUp = function () {
        var _a = this, _fragmentShader = _a._fragmentShader, _glOut = _a._glOut, _positionBuffer = _a._positionBuffer, _program = _a._program, _texCoordBuffer = _a._texCoordBuffer, _vertexShader = _a._vertexShader;
        _glOut.deleteProgram(_program);
        _glOut.deleteBuffer(_texCoordBuffer);
        _glOut.deleteBuffer(_positionBuffer);
        _glOut.deleteShader(_vertexShader);
        _glOut.deleteShader(_fragmentShader);
    };
    WebGL2PipelineProcessingStage.prototype.render = function () {
        var _a = this, _glOut = _a._glOut, _b = _a._outputDimensions, height = _b.height, width = _b.width, _outputFramebuffer = _a._outputFramebuffer, _outputTexture = _a._outputTexture, _outputTextureUnit = _a._outputTextureUnit, _program = _a._program;
        _glOut.viewport(0, 0, width, height);
        _glOut.useProgram(_program);
        if (_outputTexture) {
            _glOut.activeTexture(_glOut.TEXTURE0
                + _outputTextureUnit);
            _glOut.bindTexture(_glOut.TEXTURE_2D, _outputTexture);
        }
        _glOut.bindFramebuffer(_glOut.FRAMEBUFFER, _outputFramebuffer);
        _glOut.drawArrays(_glOut.TRIANGLE_STRIP, 0, 4);
    };
    WebGL2PipelineProcessingStage.prototype._setUniformVars = function (uniformVars) {
        var _a = this, _glOut = _a._glOut, _program = _a._program;
        _glOut.useProgram(_program);
        uniformVars.forEach(function (_a) {
            var name = _a.name, type = _a.type, values = _a.values;
            var uniformVarLocation = _glOut
                .getUniformLocation(_program, name);
            var isVector = type.split(':')[1] === 'v';
            if (isVector) {
                // @ts-ignore
                _glOut["uniform1".concat(type[0], "v")](uniformVarLocation, values);
            }
            else {
                // @ts-ignore
                _glOut["uniform".concat(values.length).concat(type[0])].apply(_glOut, __spreadArray([uniformVarLocation], values, false));
            }
        });
    };
    return WebGL2PipelineProcessingStage;
}());
exports.WebGL2PipelineProcessingStage = WebGL2PipelineProcessingStage;
//# sourceMappingURL=WebGL2PipelineProcessingStage.js.map
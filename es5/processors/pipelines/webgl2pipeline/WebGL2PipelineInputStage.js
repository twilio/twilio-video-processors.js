"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebGL2PipelineInputStage = void 0;
var webgl2PipelineHelpers_1 = require("./webgl2PipelineHelpers");
/**
 * @private
 */
var WebGL2PipelineInputStage = /** @class */ (function () {
    function WebGL2PipelineInputStage(glOut) {
        this._inputTexture = null;
        var _a = glOut.canvas, height = _a.height, width = _a.width;
        this._glOut = glOut;
        this._inputFrameTexture = (0, webgl2PipelineHelpers_1.createTexture)(glOut, glOut.RGBA8, width, height, glOut.NEAREST, glOut.NEAREST);
    }
    WebGL2PipelineInputStage.prototype.cleanUp = function () {
        var _a = this, _glOut = _a._glOut, _inputFrameTexture = _a._inputFrameTexture, _inputTexture = _a._inputTexture;
        _glOut.deleteTexture(_inputFrameTexture);
        _glOut.deleteTexture(_inputTexture);
    };
    WebGL2PipelineInputStage.prototype.render = function (inputFrame, inputTextureData) {
        var _a = this, _glOut = _a._glOut, _inputFrameTexture = _a._inputFrameTexture;
        var _b = _glOut.canvas, height = _b.height, width = _b.width;
        _glOut.viewport(0, 0, width, height);
        _glOut.clearColor(0, 0, 0, 0);
        _glOut.clear(_glOut.COLOR_BUFFER_BIT);
        if (inputFrame) {
            _glOut.activeTexture(_glOut.TEXTURE0);
            _glOut.bindTexture(_glOut.TEXTURE_2D, _inputFrameTexture);
            _glOut.texSubImage2D(_glOut.TEXTURE_2D, 0, 0, 0, width, height, _glOut.RGBA, _glOut.UNSIGNED_BYTE, inputFrame);
        }
        if (!inputTextureData) {
            return;
        }
        var data = inputTextureData.data, textureHeight = inputTextureData.height, textureWidth = inputTextureData.width;
        if (!this._inputTexture) {
            this._inputTexture = (0, webgl2PipelineHelpers_1.createTexture)(_glOut, _glOut.RGBA8, textureWidth, textureHeight, _glOut.NEAREST, _glOut.NEAREST);
        }
        _glOut.viewport(0, 0, textureWidth, textureHeight);
        _glOut.activeTexture(_glOut.TEXTURE1);
        _glOut.bindTexture(_glOut.TEXTURE_2D, this._inputTexture);
        _glOut.texSubImage2D(_glOut.TEXTURE_2D, 0, 0, 0, textureWidth, textureHeight, _glOut.RGBA, _glOut.UNSIGNED_BYTE, data);
    };
    return WebGL2PipelineInputStage;
}());
exports.WebGL2PipelineInputStage = WebGL2PipelineInputStage;
//# sourceMappingURL=WebGL2PipelineInputStage.js.map
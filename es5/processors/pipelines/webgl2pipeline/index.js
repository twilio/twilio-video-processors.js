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
exports.WebGL2Pipeline = void 0;
var Pipeline_1 = require("../Pipeline");
var WebGL2PipelineInputStage_1 = require("./WebGL2PipelineInputStage");
var WebGL2PipelineProcessingStage_1 = require("./WebGL2PipelineProcessingStage");
/**
 * @private
 */
var WebGL2Pipeline = /** @class */ (function (_super) {
    __extends(WebGL2Pipeline, _super);
    function WebGL2Pipeline() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this._stages = [];
        return _this;
    }
    WebGL2Pipeline.prototype.cleanUp = function () {
        this._stages.forEach(function (stage) { return stage.cleanUp(); });
    };
    WebGL2Pipeline.prototype.render = function (inputFrame, inputTextureData) {
        var _a = this._stages, inputStage = _a[0], otherStages = _a.slice(1);
        inputStage.render(inputFrame, inputTextureData);
        otherStages.forEach(function (stage) { return stage
            .render(); });
    };
    WebGL2Pipeline.InputStage = WebGL2PipelineInputStage_1.WebGL2PipelineInputStage;
    WebGL2Pipeline.ProcessingStage = WebGL2PipelineProcessingStage_1.WebGL2PipelineProcessingStage;
    return WebGL2Pipeline;
}(Pipeline_1.Pipeline));
exports.WebGL2Pipeline = WebGL2Pipeline;
//# sourceMappingURL=index.js.map
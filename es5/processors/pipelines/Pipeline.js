"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Pipeline = void 0;
/**
 * @private
 */
var Pipeline = /** @class */ (function () {
    function Pipeline() {
        this._stages = [];
    }
    Pipeline.prototype.addStage = function (stage) {
        this._stages.push(stage);
    };
    Pipeline.prototype.render = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        this._stages.forEach(function (stage) {
            stage.render.apply(stage, args);
        });
    };
    return Pipeline;
}());
exports.Pipeline = Pipeline;
//# sourceMappingURL=Pipeline.js.map
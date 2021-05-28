"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.GrayscaleProcessor = void 0;
var Processor_1 = require("../Processor");
/**
 * @private
 * The [[GrayscaleProcessor]] is a [[Processor]] which applies
 * a grayscale transform to a frame.
 */
var GrayscaleProcessor = /** @class */ (function (_super) {
    __extends(GrayscaleProcessor, _super);
    function GrayscaleProcessor() {
        var _this = _super.call(this) || this;
        _this._outputFrame = new OffscreenCanvas(1, 1);
        return _this;
    }
    /**
     * Applies a grayscale transform to the input frame and generate an output frame.
     * @param inputFrame - The input frame to process.
     * @returns The outputframe or null if the transform cannot be applied.
     */
    GrayscaleProcessor.prototype.processFrame = function (inputFrame) {
        this._outputFrame.width = inputFrame.width;
        this._outputFrame.height = inputFrame.height;
        var context = this._outputFrame.getContext('2d');
        if (context) {
            context.filter = 'grayscale(100%)';
            context.drawImage(inputFrame, 0, 0, inputFrame.width, inputFrame.height);
            return this._outputFrame;
        }
        return null;
    };
    return GrayscaleProcessor;
}(Processor_1.Processor));
exports.GrayscaleProcessor = GrayscaleProcessor;
//# sourceMappingURL=index.js.map
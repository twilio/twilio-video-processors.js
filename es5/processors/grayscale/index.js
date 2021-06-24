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
        return _super !== null && _super.apply(this, arguments) || this;
    }
    /**
     * Applies a grayscale transform to the input frame and draw the results to an output frame.
     * @param inputFrameBuffer - The source of the input frame to process.
     * @param outputFrameBuffer - The output frame buffer to use to draw the processed frame.
     */
    GrayscaleProcessor.prototype.processFrame = function (inputFrameBuffer, outputFrameBuffer) {
        var context = outputFrameBuffer.getContext('2d');
        if (context) {
            context.filter = 'grayscale(100%)';
            context.drawImage(inputFrameBuffer, 0, 0, inputFrameBuffer.width, inputFrameBuffer.height);
        }
    };
    return GrayscaleProcessor;
}(Processor_1.Processor));
exports.GrayscaleProcessor = GrayscaleProcessor;
//# sourceMappingURL=index.js.map
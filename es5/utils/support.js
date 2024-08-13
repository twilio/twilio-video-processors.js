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
exports.isSupported = exports.isCanvasBlurSupported = exports.isChromiumImageBitmap = exports.isBrowserSupported = void 0;
/**
 * @private
 */
function getCanvas() {
    return typeof OffscreenCanvas !== 'undefined' ? new OffscreenCanvas(1, 1) : document.createElement('canvas');
}
/**
 * @private
 */
function isBrowserSupported() {
    if (typeof window !== 'undefined' && typeof document !== 'undefined') {
        return !!(getCanvas().getContext('2d') || getCanvas().getContext('webgl2'));
    }
    else {
        return false;
    }
}
exports.isBrowserSupported = isBrowserSupported;
/**
 * @private
 */
function isChromiumImageBitmap() {
    return /Chrome/.test(navigator.userAgent)
        && typeof createImageBitmap === 'function';
}
exports.isChromiumImageBitmap = isChromiumImageBitmap;
/**
 * @private
 */
exports.isCanvasBlurSupported = (function () {
    var blackPixel = [0, 0, 0, 255];
    var whitePixel = [255, 255, 255, 255];
    var inputImageData = new ImageData(new Uint8ClampedArray(__spreadArray(__spreadArray(__spreadArray(__spreadArray(__spreadArray(__spreadArray(__spreadArray(__spreadArray(__spreadArray([], blackPixel, true), blackPixel, true), blackPixel, true), blackPixel, true), whitePixel, true), blackPixel, true), blackPixel, true), blackPixel, true), blackPixel, true)), 3, 3);
    var canvas = getCanvas();
    var context = canvas.getContext('2d');
    canvas.width = 3;
    canvas.height = 3;
    context.putImageData(inputImageData, 0, 0);
    context.filter = 'blur(1px)';
    context.drawImage(canvas, 0, 0);
    var data = context.getImageData(0, 0, 3, 3).data;
    return data[0] > 0;
})();
/**
 * Check if the current browser is officially supported by twilio-video-procesors.js.
 * This is set to `true` for browsers that supports canvas
 * [2D](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D) or
 * [webgl2](https://developer.mozilla.org/en-US/docs/Web/API/WebGL2RenderingContext)
 * rendering context.
 * @example
 * ```ts
 * import { isSupported } from '@twilio/video-processors';
 *
 * if (isSupported) {
 *   // Initialize the background processors
 * }
 * ```
 */
exports.isSupported = isBrowserSupported();
//# sourceMappingURL=support.js.map
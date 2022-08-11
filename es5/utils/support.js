"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isSupported = exports.isBrowserSupported = void 0;
/**
 * @private
 */
function getCanvas() {
    return typeof window.OffscreenCanvas !== 'undefined' ? new window.OffscreenCanvas(1, 1) : document.createElement('canvas');
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
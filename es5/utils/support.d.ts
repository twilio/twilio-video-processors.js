/**
 * @private
 */
export declare function isBrowserSupported(): boolean;
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
export declare const isSupported: boolean;

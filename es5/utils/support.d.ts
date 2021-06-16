/**
 * @private
 */
export declare function isBrowserSupported(): boolean;
/**
 * Check if the current browser is officially supported by twilio-video-procesors.js.
 * This is set to `true` for chromium-based desktop browsers.
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

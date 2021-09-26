/**
 * @private
 */
 export function isBrowserSupported() {
  return !!window && !!window.OffscreenCanvas && !(/Mobi/i.test(window.navigator.userAgent)) && !!window.chrome;
}

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
 export const isSupported = isBrowserSupported();

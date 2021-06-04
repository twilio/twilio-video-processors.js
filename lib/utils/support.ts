/**
 * @private
 */
 export function isBrowserSupported() {
  return !!window.OffscreenCanvas && !(/Mobi/i.test(window.navigator.userAgent)) && !!window.chrome;
}

/**
 * Check if the current browser is officially supported by twilio-video-procesors.js.
 * @returns {boolean}
 * @example
 * ```ts
 * if(!isSupported){
 *  console.log('Browser is not supported');
 * }
 * ```
 */
 export const isSupported = isBrowserSupported();

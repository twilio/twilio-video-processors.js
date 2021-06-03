/**
 * Check if the current browser is officially supported by twilio-video-procesors.js.
 * @returns {boolean}
 */
export function isSupported() {
  const isMobileDevice = /Mobi/i.test(window.navigator.userAgent);
  let supported;
  if (typeof OffscreenCanvas !== 'undefined' && !isMobileDevice) {
    supported = true;
  } else {
    supported = false;
  }
  return supported;
}

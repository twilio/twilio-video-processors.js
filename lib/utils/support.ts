/**
 * Check if the current browser is officially supported by twilio-video-procesors.js.
 * @returns {boolean}
 */
export function isSupported() {
  let supported;
  if (typeof OffscreenCanvas !== 'undefined') {
    supported = true;
  } else {
    supported = false;
  }
  return supported;
}

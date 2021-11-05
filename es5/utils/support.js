"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isSupported = exports.isBrowserSupported = void 0;
/**
 * @private
 */
function isBrowserSupported() {
    if (typeof window !== 'undefined') {
        return !!window.OffscreenCanvas && !(/Mobi/i.test(window.navigator.userAgent)) && !!window.chrome;
    }
    else {
        return false;
    }
}
exports.isBrowserSupported = isBrowserSupported;
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
exports.isSupported = isBrowserSupported();
//# sourceMappingURL=support.js.map
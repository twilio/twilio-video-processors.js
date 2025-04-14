/**
 * @private
 */
function getCanvas() {
  return typeof OffscreenCanvas !== 'undefined' ? new OffscreenCanvas(1, 1) : document.createElement('canvas');
}

/**
 * Represents the identifier for the rendering context type.
 */
type RenderingContextType = '2d' | 'webgl2' | null;


/**
 * @private
 * @returns {RenderingContextType} Determines the best available rendering context type.
 * Returns 'webgl2' if available, '2d' if available but webgl2 is not,
 * or null if neither context is available or if running in a non-browser environment.
 */
function getRenderingContextType(): RenderingContextType {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return null;
  }
  const canvas = getCanvas();
  if (canvas.getContext('webgl2')) {
    return 'webgl2';
  }
  if (canvas.getContext('2d')) {
    return '2d';
  }
  return null;
}

/**
 * @private
 */
export function isBrowserSupported() {
  // Check if any supported rendering context is available
  return getRenderingContextType() !== null;
}

/**
 * @private
 */
export function isChromiumImageBitmap() {
  return /Chrome/.test(navigator.userAgent)
    && typeof createImageBitmap === 'function';
}

/**
 * @private
 */
export const isCanvasBlurSupported = (() => {
  const blackPixel = [0, 0, 0, 255];
  const whitePixel = [255, 255, 255, 255];

  const inputImageData =  new ImageData(new Uint8ClampedArray([
    ...blackPixel, ...blackPixel, ...blackPixel,
    ...blackPixel, ...whitePixel, ...blackPixel,
    ...blackPixel, ...blackPixel, ...blackPixel
  ]), 3, 3);

  const canvas = getCanvas();
  const context = canvas.getContext('2d') as CanvasRenderingContext2D;

  canvas.width = 3;
  canvas.height = 3;
  context.putImageData(inputImageData, 0, 0);
  context.filter = 'blur(1px)';
  context.drawImage(canvas, 0, 0);

  const { data } = context.getImageData(0, 0, 3, 3);
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
export const isSupported = isBrowserSupported();

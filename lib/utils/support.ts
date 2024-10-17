/**
 * @private
 */
function getCanvas() {
  return typeof OffscreenCanvas !== 'undefined' ? new OffscreenCanvas(1, 1) : document.createElement('canvas');
}

/**
 * @private
 */
export function isBrowserSupported() {
  if (typeof window !== 'undefined' && typeof document !== 'undefined') {
    return !!(getCanvas().getContext('2d') || getCanvas().getContext('webgl2'));
  } else {
    return false;
  }
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

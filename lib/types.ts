/**
 * @private
 */
 declare global {
  interface Window {
    chrome: any;
    createTwilioTFLiteModule: () => Promise<any>;
    createTwilioTFLiteSIMDModule: () => Promise<any>;
    OffscreenCanvas: typeof OffscreenCanvas;
    Twilio: Object & { VideoProcessors?: any };
  }
}

/**
 * @private
 */
export enum WebGL2PipelineType {
  Blur = 'blur',
  Image = 'image',
}

/**
 * @private
 */
export interface Timing {
  delay?: number;
  end?: number;
  start?: number;
}

/**
 * @private
 */
export interface Dimensions {
  height: number;
  width: number;
}

/**
 * ImageFit specifies the positioning of an image inside a viewport.
 */
export enum ImageFit {
  /**
   * Scale the image up or down to fill the viewport while preserving the aspect ratio.
   * The image will be fully visible but will add empty space in the viewport if
   * aspect ratios do not match.
   */
  Contain = 'Contain',

  /**
   * Scale the image to fill both height and width of the viewport while preserving
   * the aspect ratio, but will crop the image if aspect ratios do not match.
   */
  Cover = 'Cover',

  /**
   * Stretches the image to fill the viewport regardless of aspect ratio.
   */
  Fill = 'Fill',

  /**
   * Ignore height and width and use the original size.
   */
  None = 'None'
}

/**
 * Specifies which pipeline to use when processing video frames.
 */
export enum Pipeline {
  /**
   * Use canvas 2d rendering context. Some browsers such as Safari do not
   * have full support of this feature. Please test your application to make sure it works as intented. See
   * [browser compatibility page](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D#browser_compatibility)
   * for reference.
   */
  Canvas2D = 'Canvas2D',

  /**
   * Use canvas webgl2 rendering context. Major browsers have support for this feature. However, this does not work
   * on some older versions of browsers. Please test your application to make sure it works as intented. See
   * [browser compatibility page](https://developer.mozilla.org/en-US/docs/Web/API/WebGL2RenderingContext#browser_compatibility)
   * for reference.
   */
  WebGL2 = 'WebGL2'
}

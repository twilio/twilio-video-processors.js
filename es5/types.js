"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Pipeline = exports.ImageFit = exports.WebGL2PipelineType = void 0;
/**
 * @private
 */
var WebGL2PipelineType;
(function (WebGL2PipelineType) {
    WebGL2PipelineType["Blur"] = "blur";
    WebGL2PipelineType["Image"] = "image";
})(WebGL2PipelineType = exports.WebGL2PipelineType || (exports.WebGL2PipelineType = {}));
/**
 * ImageFit specifies the positioning of an image inside a viewport.
 */
var ImageFit;
(function (ImageFit) {
    /**
     * Scale the image up or down to fill the viewport while preserving the aspect ratio.
     * The image will be fully visible but will add empty space in the viewport if
     * aspect ratios do not match.
     */
    ImageFit["Contain"] = "Contain";
    /**
     * Scale the image to fill both height and width of the viewport while preserving
     * the aspect ratio, but will crop the image if aspect ratios do not match.
     */
    ImageFit["Cover"] = "Cover";
    /**
     * Stretches the image to fill the viewport regardless of aspect ratio.
     */
    ImageFit["Fill"] = "Fill";
    /**
     * Ignore height and width and use the original size.
     */
    ImageFit["None"] = "None";
})(ImageFit = exports.ImageFit || (exports.ImageFit = {}));
/**
 * Specifies which pipeline to use when processing video frames.
 */
var Pipeline;
(function (Pipeline) {
    /**
     * Use canvas 2d rendering context. Some browsers such as Safari do not
     * have full support of this feature. Please test your application to make sure it works as intented. See
     * [browser compatibility page](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D#browser_compatibility)
     * for reference.
     */
    Pipeline["Canvas2D"] = "Canvas2D";
    /**
     * Use canvas webgl2 rendering context. Major browsers have support for this feature. However, this does not work
     * on some older versions of browsers. Please test your application to make sure it works as intented. See
     * [browser compatibility page](https://developer.mozilla.org/en-US/docs/Web/API/WebGL2RenderingContext#browser_compatibility)
     * for reference.
     */
    Pipeline["WebGL2"] = "WebGL2";
})(Pipeline = exports.Pipeline || (exports.Pipeline = {}));
//# sourceMappingURL=types.js.map
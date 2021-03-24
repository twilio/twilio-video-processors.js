"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ImageFit = void 0;
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
//# sourceMappingURL=types.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.INFERENCE_RESOLUTION = exports.MASK_BLUR_RADIUS = exports.INFERENCE_CONFIG = exports.MODEL_CONFIG = exports.DEFAULT_BLUR_FILTER_RADIUS = void 0;
exports.DEFAULT_BLUR_FILTER_RADIUS = 5;
exports.MODEL_CONFIG = {
    architecture: 'MobileNetV1',
    outputStride: 16,
    multiplier: 0.75,
    quantBytes: 4,
};
exports.INFERENCE_CONFIG = {
    internalResolution: 1,
    maxDetections: 1,
    segmentationThreshold: 0.75,
};
exports.MASK_BLUR_RADIUS = 3;
exports.INFERENCE_RESOLUTION = {
    width: 224,
    height: 224,
};
//# sourceMappingURL=constants.js.map
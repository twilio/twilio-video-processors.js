"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WASM_INFERENCE_DIMENSIONS = exports.BODYPIX_INFERENCE_DIMENSIONS = exports.INFERENCE_CONFIG = exports.MODEL_CONFIG = exports.TFLITE_SIMD_LOADER_NAME = exports.TFLITE_LOADER_NAME = exports.MODEL_NAME = exports.PERSON_PROBABILITY_THRESHOLD = exports.HISTORY_COUNT = exports.MASK_BLUR_RADIUS = exports.DEBOUNCE = exports.BLUR_FILTER_RADIUS = void 0;
exports.BLUR_FILTER_RADIUS = 15;
exports.DEBOUNCE = 2;
exports.MASK_BLUR_RADIUS = 5;
exports.HISTORY_COUNT = 5;
exports.PERSON_PROBABILITY_THRESHOLD = 0.4;
exports.MODEL_NAME = 'selfie_segmentation_landscape.tflite';
exports.TFLITE_LOADER_NAME = 'tflite-1-0-0.js';
exports.TFLITE_SIMD_LOADER_NAME = 'tflite-simd-1-0-0.js';
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
exports.BODYPIX_INFERENCE_DIMENSIONS = {
    width: 224,
    height: 224,
};
exports.WASM_INFERENCE_DIMENSIONS = {
    width: 256,
    height: 144,
};
//# sourceMappingURL=constants.js.map
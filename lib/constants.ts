import { Dimensions } from './types';

export const BLUR_FILTER_RADIUS = 15;
export const MASK_BLUR_RADIUS = 8;
export const MODEL_NAME = 'selfie_segmentation_landscape.tflite';
export const TFLITE_LOADER_NAME = 'tflite-1-0-0.js';
export const TFLITE_SIMD_LOADER_NAME = 'tflite-simd-1-0-0.js';

export const WASM_INFERENCE_DIMENSIONS: Dimensions = {
  width: 256,
  height: 144,
};

import { Dimensions } from './types';

export const BLUR_FILTER_RADIUS = 15;
export const MASK_BLUR_RADIUS = 8;
export const MODEL_NAME = 'selfie_segmentation_landscape.tflite';
export const TFLITE_LOADER_NAME = 'tflite-1-0-0.js';
export const TFLITE_SIMD_LOADER_NAME = 'tflite-simd-1-0-0.js';
export const TWILIO_GAUSSIAN_BLUR_BACKGROUND_PROCESSOR_PIPELINE_WORKER = 'twilio-gaussian-blur-background-processor-pipeline-worker.js';
export const TWILIO_VIRTUAL_BACKGROUND_PROCESSOR_PIPELINE_WORKER = 'twilio-virtual-background-processor-pipeline-worker.js';


export const WASM_INFERENCE_DIMENSIONS: Dimensions = {
  width: 256,
  height: 144,
};

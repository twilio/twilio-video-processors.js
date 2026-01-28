import { Dimensions } from './types';

export const BLUR_FILTER_RADIUS = 15;
export const HYSTERESIS_LOW = 80;
export const HYSTERESIS_HIGH = 180;
export const MASK_BLUR_RADIUS = 8;
export const SIGMA_COLOR = 0.1;
export const MODEL_NAME = 'selfie_segmentation_landscape.tflite';
export const TFLITE_LOADER_NAME = 'tflite-1-0-0.js';
export const TFLITE_SIMD_LOADER_NAME = 'tflite-simd-1-0-0.js';
export const TWILIO_GAUSSIAN_BLUR_BACKGROUND_PROCESSOR_PIPELINE_WORKER = 'twilio-gaussian-blur-background-processor-pipeline-worker.js';
export const TWILIO_VIRTUAL_BACKGROUND_PROCESSOR_PIPELINE_WORKER = 'twilio-virtual-background-processor-pipeline-worker.js';

export type ModelType = 'landscape' | 'square';

export const MODEL_CONFIGS: Record<ModelType, { name: string; dimensions: Dimensions }> = {
  landscape: {
    name: 'selfie_segmentation_landscape.tflite',
    dimensions: { width: 256, height: 144 }
  },
  square: {
    name: 'selfie_segmenter_square.tflite',
    dimensions: { width: 256, height: 256 }
  }
};

export const DEFAULT_MODEL_TYPE: ModelType = 'landscape';

export const WASM_INFERENCE_DIMENSIONS: Dimensions = {
  width: 256,
  height: 144,
};

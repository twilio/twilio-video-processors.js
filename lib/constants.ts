import { ModelConfig, PersonInferenceConfig } from '@tensorflow-models/body-pix/dist/body_pix_model';
import { Dimensions } from './types';

export const BLUR_FILTER_RADIUS = 15;
export const DEBOUNCE = 2;
export const MASK_BLUR_RADIUS = 3;
export const HISTORY_COUNT = 5;
export const PERSON_PROBABILITY_THRESHOLD = 0.5;

export const MODEL_CONFIG: ModelConfig = {
  architecture: 'MobileNetV1',
  outputStride: 16,
  multiplier: 0.75,
  quantBytes: 4,
};

export const INFERENCE_CONFIG: PersonInferenceConfig = {
  internalResolution: 1,
  maxDetections: 1,
  segmentationThreshold: 0.75,
};

export const BODYPIX_INFERENCE_DIMENSIONS: Dimensions = {
  width: 224,
  height: 224,
};

export const WASM_INFERENCE_DIMENSIONS: Dimensions = {
  width: 256,
  height: 256,
};

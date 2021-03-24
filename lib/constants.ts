import { ModelConfig, PersonInferenceConfig } from '@tensorflow-models/body-pix/dist/body_pix_model';
import { Dimensions } from './types';

export const DEFAULT_BLUR_FILTER_RADIUS = 5;

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

export const MASK_BLUR_RADIUS = 3;

export const INFERENCE_DIMENSIONS: Dimensions = {
  width: 224,
  height: 224,
};

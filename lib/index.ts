import { GaussianBlurBackgroundProcessor, GaussianBlurBackgroundProcessorOptions } from './processors/background/GaussianBlurBackgroundProcessor';
import { VirtualBackgroundProcessor, VirtualBackgroundProcessorOptions } from './processors/background/VirtualBackgroundProcessor';
import { HysteresisConfig, ImageFit } from './types';
import { isSupported } from './utils/support';
import { version } from './utils/version';

if (typeof window !== 'undefined') {
  window.Twilio = window.Twilio || {};
  window.Twilio.VideoProcessors = {
    ...window.Twilio.VideoProcessors,
    GaussianBlurBackgroundProcessor,
    ImageFit,
    isSupported,
    version,
    VirtualBackgroundProcessor,
  };
}

export {
  GaussianBlurBackgroundProcessor,
  GaussianBlurBackgroundProcessorOptions,
  HysteresisConfig,
  ImageFit,
  isSupported,
  version,
  VirtualBackgroundProcessor,
  VirtualBackgroundProcessorOptions,
};

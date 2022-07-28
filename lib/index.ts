import { GaussianBlurBackgroundProcessor, GaussianBlurBackgroundProcessorOptions } from './processors/background/GaussianBlurBackgroundProcessor';
import { VirtualBackgroundProcessor, VirtualBackgroundProcessorOptions } from './processors/background/VirtualBackgroundProcessor';
import { ImageFit, Pipeline } from './types';
import { isSupported } from './utils/support';
import { version } from './utils/version';

if (typeof window !== 'undefined') {
  window.Twilio = window.Twilio || {};
  window.Twilio.VideoProcessors = {
    ...window.Twilio.VideoProcessors,
    GaussianBlurBackgroundProcessor,
    ImageFit,
    Pipeline,
    isSupported,
    version,
    VirtualBackgroundProcessor,
  };
}

export {
  GaussianBlurBackgroundProcessor,
  GaussianBlurBackgroundProcessorOptions,
  ImageFit,
  Pipeline,
  isSupported,
  version,
  VirtualBackgroundProcessor,
  VirtualBackgroundProcessorOptions,
};

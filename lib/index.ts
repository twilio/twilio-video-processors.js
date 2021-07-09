import { GaussianBlurBackgroundProcessor, GaussianBlurBackgroundProcessorOptions } from './processors/background/GaussianBlurBackgroundProcessor';
import { VirtualBackgroundProcessor, VirtualBackgroundProcessorOptions } from './processors/background/VirtualBackgroundProcessor';
import { ImageFit } from './types';
import { isSupported } from './utils/support';
import { version } from './utils/version';

window.Twilio = window.Twilio || {};
window.Twilio.VideoProcessors = {
  ...window.Twilio.VideoProcessors,
  GaussianBlurBackgroundProcessor,
  ImageFit,
  isSupported,
  version,
  VirtualBackgroundProcessor,
};

export {
  GaussianBlurBackgroundProcessor,
  GaussianBlurBackgroundProcessorOptions,
  ImageFit,
  isSupported,
  version,
  VirtualBackgroundProcessor,
  VirtualBackgroundProcessorOptions,
};

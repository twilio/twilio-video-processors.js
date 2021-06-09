import { BackgroundProcessor, BackgroundProcessorOptions } from './processors/background/BackgroundProcessor';
import { GaussianBlurBackgroundProcessor, GaussianBlurBackgroundProcessorOptions } from './processors/background/GaussianBlurBackgroundProcessor';
import { VirtualBackgroundProcessor, VirtualBackgroundProcessorOptions } from './processors/background/VirtualBackgroundProcessor';
import { GrayscaleProcessor } from './processors/grayscale';
import { Processor } from './processors/Processor';
import { Dimensions, ImageFit } from './types';
import { isSupported } from './utils/support';
import { version } from './utils/version';

window.Twilio = window.Twilio || {};
window.Twilio.VideoProcessors = {
  ...window.Twilio.VideoProcessors,
  GaussianBlurBackgroundProcessor,
  GrayscaleProcessor,
  ImageFit,
  isSupported,
  version,
  VirtualBackgroundProcessor,
};

export {
  BackgroundProcessor,
  BackgroundProcessorOptions,
  GaussianBlurBackgroundProcessor,
  GaussianBlurBackgroundProcessorOptions,
  GrayscaleProcessor,
  ImageFit,
  isSupported,
  version,
  Processor,
  Dimensions,
  VirtualBackgroundProcessor,
  VirtualBackgroundProcessorOptions,
};

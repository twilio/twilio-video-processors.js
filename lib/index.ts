import { GrayscaleProcessor } from './processors/grayscale';
import { Processor } from './processors/Processor';

/**
 * @private
 */
declare global {
  interface Window {
    Twilio: Object & { VideoProcessors?: any };
  }
}

window.Twilio = window.Twilio || {};
window.Twilio.VideoProcessors = {
  ...window.Twilio.VideoProcessors,
  GrayscaleProcessor,
};

export {
  GrayscaleProcessor,
  Processor,
};

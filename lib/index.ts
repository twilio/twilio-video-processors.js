import { GrayscaleVideoProcessor } from './videoprocessors/grayscale';
import { VideoProcessor } from './videoprocessors/VideoProcessor';

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
  GrayscaleVideoProcessor,
};

export {
  GrayscaleVideoProcessor,
  VideoProcessor,
};

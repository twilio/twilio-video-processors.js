import * as assert from 'assert';
import { GrayscaleVideoProcessor } from '../../lib/videoprocessors/grayscale';

describe('GrayscaleVideoProcessor', () => {
  it('should return an outputFrame', () => {
    const processor = new GrayscaleVideoProcessor();
    const testFrame = new OffscreenCanvas(1, 1);
    const frame = processor.processFrame(testFrame);
    assert(!!frame);
  });
});

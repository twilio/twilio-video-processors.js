import * as assert from 'assert';
import { GrayscaleProcessor } from '../../../../lib/processors/grayscale';

describe('GrayscaleProcessor', () => {
  it('should return an outputFrame', () => {
    const processor = new GrayscaleProcessor();
    const testFrame = new OffscreenCanvas(1, 1);
    const frame = processor.processFrame(testFrame);
    assert(!!frame);
  });
});

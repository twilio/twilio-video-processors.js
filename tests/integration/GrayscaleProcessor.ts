import * as assert from 'assert';
import { GrayscaleProcessor } from '../../lib/processors/grayscale';

describe('GrayscaleProcessor', () => {
  it('should process frame without an exception', () => {
    const processor = new GrayscaleProcessor();
    const testFrame = new OffscreenCanvas(2, 2);
    const canvas = document.createElement('canvas');
    processor.processFrame(testFrame, canvas);
  });
});

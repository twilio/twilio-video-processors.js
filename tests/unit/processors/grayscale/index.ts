import * as assert from 'assert';
import { GrayscaleProcessor } from '../../../../lib/processors/grayscale';

describe('GrayscaleProcessor', () => {
  it('should draw to an outputFrame', () => {
    const processor = new GrayscaleProcessor();
    const input = new OffscreenCanvas(2, 2);
    const output = document.createElement('canvas') as any;
    processor.processFrame(input, output);

    assert.strictEqual(output.drawing.inputFrame.width, 2);
    assert.strictEqual(output.drawing.inputFrame.height, 2);
    assert.strictEqual(output.drawing.width, 2);
    assert.strictEqual(output.drawing.height, 2);
  });
});

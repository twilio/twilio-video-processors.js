import * as assert from 'assert';
import { ImageFit, VirtualBackgroundProcessor, VirtualBackgroundProcessorOptions } from '../../../lib/index';

// TODO(csantos): Add snapshot tests
describe('VirtualBackgroundProcessor', () => {
  it('should create instance', async () => {
    const img = { complete: true, naturalHeight: 720 } as HTMLImageElement;
    const options: VirtualBackgroundProcessorOptions = {
      assetsPath: '',
      backgroundImage: img,
      fitType: ImageFit.Contain,
      maskBlurRadius: 3
    };
    const processor = new VirtualBackgroundProcessor(options);
    assert.strictEqual(processor.maskBlurRadius, 3);
    assert.strictEqual(processor.fitType, ImageFit.Contain);
    assert.strictEqual(processor.backgroundImage, img);
  });
});

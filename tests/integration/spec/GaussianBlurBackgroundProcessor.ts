import * as assert from 'assert';
import { GaussianBlurBackgroundProcessor, GaussianBlurBackgroundProcessorOptions } from '../../../lib/index';

// TODO(csantos): Add snapshot tests
describe('GaussianBlurBackgroundProcessor', () => {
  it('should create instance', async () => {
    const options: GaussianBlurBackgroundProcessorOptions = {
      assetsPath: '',
      blurFilterRadius: 10,
      maskBlurRadius: 3
    };
    const processor = new GaussianBlurBackgroundProcessor(options);
    assert.strictEqual(processor.blurFilterRadius, 10);
    assert.strictEqual(processor.maskBlurRadius, 3);
  });
});

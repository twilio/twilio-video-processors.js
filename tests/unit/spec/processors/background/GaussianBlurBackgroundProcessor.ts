import * as assert from 'assert';
import * as sinon from 'sinon';
import { BackgroundProcessor } from '../../../../../lib/processors/background/BackgroundProcessor';
import { GaussianBlurBackgroundProcessor } from '../../../../../lib/processors/background/GaussianBlurBackgroundProcessor';
import { BLUR_FILTER_RADIUS } from '../../../../../lib/constants';

describe('GaussianBlurBackgroundProcessor', () => {
  let consoleWarnStub: any;
  before(() => {
    (BackgroundProcessor as any)._loadModel = sinon.stub();
    consoleWarnStub = sinon.stub(console, 'warn');
  });

  after(() => {
    consoleWarnStub.restore();
  });

  [
    null, 
    undefined, 
    { }, 
    { blurFilterRadius: null },
    { blurFilterRadius: undefined },
    { blurFilterRadius: 0 },
    { blurFilterRadius: 1 },
    { blurFilterRadius: 2 }
  ].forEach((option: any) => {
    const useDefault = !option || !option.blurFilterRadius || option.blurFilterRadius < 1;
    const param = option ? JSON.stringify(option) : option;
    it(`should set blurFilterRadius to ${useDefault ? 'default' : option.blurFilterRadius} if option is ${param}`, () => {
      const processor = new GaussianBlurBackgroundProcessor({ ...option, assetsPath: 'foo' });
      const expected = useDefault ? BLUR_FILTER_RADIUS : option.blurFilterRadius;
      assert.strictEqual(processor.blurFilterRadius, expected);
    });

    if (option) {
      it(`should set blurFilterRadius to ${useDefault ? 'default' : option.blurFilterRadius} if blurFilterRadius being set is ${option.blurFilterRadius}`, () => {
        const processor = new GaussianBlurBackgroundProcessor({ assetsPath: 'foo' });
        processor.blurFilterRadius = option.blurFilterRadius;
        const expected = useDefault ? BLUR_FILTER_RADIUS : option.blurFilterRadius;
        assert.strictEqual(processor.blurFilterRadius, expected);
      });
    }
  });
});

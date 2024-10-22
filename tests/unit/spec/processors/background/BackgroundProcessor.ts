import * as assert from 'assert';
import * as sinon from 'sinon';
import { BackgroundProcessor } from '../../../../../lib/processors/background/BackgroundProcessor';
import { MASK_BLUR_RADIUS } from '../../../../../lib/constants';
import { TwilioTFLite } from '../../../../../lib/utils/TwilioTFLite';
import { BackgroundProcessorPipeline } from '../../../../../lib/processors/background/pipelines/backgroundprocessorpipeline';

class MyBackgroundProcessor extends BackgroundProcessor {
  tflite: TwilioTFLite;

  constructor(options?: any) {
    const backgroundProcessorPipelineStub = sinon.createStubInstance(BackgroundProcessorPipeline) as any;
    backgroundProcessorPipelineStub.setMaskBlurRadius.returns(new Promise<void>(resolve => resolve()));
    super(backgroundProcessorPipelineStub, options);
    // @ts-ignore
    BackgroundProcessor._tflite = new TwilioTFLite();
    // @ts-ignore
    this.tflite = BackgroundProcessor._tflite;
  }

  protected _setBackground(inputFrame: any): void {
    /* noop */
  }
}

describe('BackgroundProcessor', () => {
  let consoleWarnStub: any;
  let loadModel: any;
  before(() => {
    loadModel = sinon.stub();
    consoleWarnStub = sinon.stub(console, 'warn');
  });

  after(() => {
    consoleWarnStub.restore();
  });

  it('should throw an error if options is not provided', () => {
    assert.throws(() => new MyBackgroundProcessor());
  });

  describe('assetsPath', () => {
    [
      null,
      undefined,
    ].forEach((value: any) => {
      it(`should throw if assetsPath param is ${value}`, () => {
        assert.throws(() => new MyBackgroundProcessor({ assetsPath: value }));
      });
    });

    it('should set assetsPath for empty string', () => {
      const processor: any = new MyBackgroundProcessor({ assetsPath: '' });
      assert.strictEqual(processor._assetsPath, '');
    });

    it('should set assetsPath for website root folder', () => {
      const processor: any = new MyBackgroundProcessor({ assetsPath: '/' });
      assert.strictEqual(processor._assetsPath, '/');
    });

    it('should set assetsPath for non-empty string and if path does not ends in /', () => {
      const processor: any = new MyBackgroundProcessor({ assetsPath: 'https://foo' });
      assert.strictEqual(processor._assetsPath, 'https://foo/');
    });

    it('should set assetsPath for non-empty string and if path ends in /', () => {
      const processor: any = new MyBackgroundProcessor({ assetsPath: 'https://foo/' });
      assert.strictEqual(processor._assetsPath, 'https://foo/');
    });
  });

  describe('maskBlurRadius', () => {
    [
      null,
      undefined,
      {},
      { maskBlurRadius: null },
      { maskBlurRadius: undefined },
      { maskBlurRadius: 0 },
      { maskBlurRadius: 1 },
      { maskBlurRadius: 2 }
    ].forEach((option: any) => {
      const useDefault = !option || typeof option.maskBlurRadius !== 'number';
      const param = option ? JSON.stringify(option) : option;
      it(`should set maskBlurRadius to ${useDefault ? 'default' : option.maskBlurRadius} if option is ${param}`, () => {
        const processor = new MyBackgroundProcessor({ ...option, assetsPath: 'foo' });
        const expected = useDefault ? MASK_BLUR_RADIUS : option.maskBlurRadius;
        assert.strictEqual(processor.maskBlurRadius, expected);
      });

      if (option) {
        it(`should set maskBlurRadius to ${useDefault ? 'default' : option.maskBlurRadius} if maskBlurRadius being set is ${option.blurFilterRadius}`, () => {
          const processor = new MyBackgroundProcessor({ assetsPath: 'foo' });
          processor.maskBlurRadius = option.maskBlurRadius;
          const expected = useDefault ? MASK_BLUR_RADIUS : option.maskBlurRadius;
          assert.strictEqual(processor.maskBlurRadius, expected);
        });
      }
    });
  });
});

import * as assert from 'assert';
import * as sinon from 'sinon';
import { BackgroundProcessor } from '../../../../../lib/processors/background/BackgroundProcessor';
import { HYSTERESIS_HIGH, HYSTERESIS_LOW, MASK_BLUR_RADIUS } from '../../../../../lib/constants';
import { TwilioTFLite } from '../../../../../lib/utils/TwilioTFLite';
import { BackgroundProcessorPipeline } from '../../../../../lib/processors/background/pipelines/backgroundprocessorpipeline';

class MyBackgroundProcessor extends BackgroundProcessor {
  tflite: TwilioTFLite;

  constructor(options?: any) {
    const backgroundProcessorPipelineStub = sinon.createStubInstance(BackgroundProcessorPipeline) as any;
    backgroundProcessorPipelineStub.setHysteresisEnabled.returns(new Promise<void>(resolve => resolve()));
    backgroundProcessorPipelineStub.setHysteresisHighThreshold.returns(new Promise<void>(resolve => resolve()));
    backgroundProcessorPipelineStub.setHysteresisLowThreshold.returns(new Promise<void>(resolve => resolve()));
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

  describe('hysteresisEnabled', () => {
    it('should default to true', () => {
      const processor = new MyBackgroundProcessor({ assetsPath: 'foo' });
      assert.strictEqual(processor.hysteresisEnabled, true);
    });

    it('should set hysteresisEnabled to false via constructor', () => {
      const processor = new MyBackgroundProcessor({ assetsPath: 'foo', hysteresisEnabled: false });
      assert.strictEqual(processor.hysteresisEnabled, false);
    });

    it('should update hysteresisEnabled via setter', () => {
      const processor = new MyBackgroundProcessor({ assetsPath: 'foo' });
      processor.hysteresisEnabled = false;
      assert.strictEqual(processor.hysteresisEnabled, false);
      processor.hysteresisEnabled = true;
      assert.strictEqual(processor.hysteresisEnabled, true);
    });

    it('should warn and keep current value for invalid input', () => {
      const processor = new MyBackgroundProcessor({ assetsPath: 'foo' });
      processor.hysteresisEnabled = 'invalid' as any;
      assert.strictEqual(processor.hysteresisEnabled, true);
      assert(consoleWarnStub.calledWith('Provided hysteresisEnabled is not a boolean.'));
    });
  });

  describe('hysteresisHighThreshold', () => {
    it('should default to HYSTERESIS_HIGH', () => {
      const processor = new MyBackgroundProcessor({ assetsPath: 'foo' });
      assert.strictEqual(processor.hysteresisHighThreshold, HYSTERESIS_HIGH);
    });

    it('should set via constructor', () => {
      const processor = new MyBackgroundProcessor({ assetsPath: 'foo', hysteresisHighThreshold: 200 });
      assert.strictEqual(processor.hysteresisHighThreshold, 200);
    });

    it('should update via setter', () => {
      const processor = new MyBackgroundProcessor({ assetsPath: 'foo' });
      processor.hysteresisHighThreshold = 150;
      assert.strictEqual(processor.hysteresisHighThreshold, 150);
    });

    it('should warn and use default for invalid input', () => {
      const processor = new MyBackgroundProcessor({ assetsPath: 'foo' });
      processor.hysteresisHighThreshold = 'bad' as any;
      assert.strictEqual(processor.hysteresisHighThreshold, HYSTERESIS_HIGH);
      assert(consoleWarnStub.calledWith(`Valid hysteresisHighThreshold not found. Using ${HYSTERESIS_HIGH} as default.`));
    });

    it('should warn and use default for NaN', () => {
      const processor = new MyBackgroundProcessor({ assetsPath: 'foo' });
      processor.hysteresisHighThreshold = NaN;
      assert.strictEqual(processor.hysteresisHighThreshold, HYSTERESIS_HIGH);
    });

    it('should warn and use default for out-of-range value', () => {
      const processor = new MyBackgroundProcessor({ assetsPath: 'foo' });
      processor.hysteresisHighThreshold = 300;
      assert.strictEqual(processor.hysteresisHighThreshold, HYSTERESIS_HIGH);
    });
  });

  describe('hysteresisLowThreshold', () => {
    it('should default to HYSTERESIS_LOW', () => {
      const processor = new MyBackgroundProcessor({ assetsPath: 'foo' });
      assert.strictEqual(processor.hysteresisLowThreshold, HYSTERESIS_LOW);
    });

    it('should set via constructor', () => {
      const processor = new MyBackgroundProcessor({ assetsPath: 'foo', hysteresisLowThreshold: 50 });
      assert.strictEqual(processor.hysteresisLowThreshold, 50);
    });

    it('should update via setter', () => {
      const processor = new MyBackgroundProcessor({ assetsPath: 'foo' });
      processor.hysteresisLowThreshold = 40;
      assert.strictEqual(processor.hysteresisLowThreshold, 40);
    });

    it('should warn and use default for invalid input', () => {
      const processor = new MyBackgroundProcessor({ assetsPath: 'foo' });
      processor.hysteresisLowThreshold = -10;
      assert.strictEqual(processor.hysteresisLowThreshold, HYSTERESIS_LOW);
      assert(consoleWarnStub.calledWith(`Valid hysteresisLowThreshold not found. Using ${HYSTERESIS_LOW} as default.`));
    });

    it('should warn and use default for NaN', () => {
      const processor = new MyBackgroundProcessor({ assetsPath: 'foo' });
      processor.hysteresisLowThreshold = NaN;
      assert.strictEqual(processor.hysteresisLowThreshold, HYSTERESIS_LOW);
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

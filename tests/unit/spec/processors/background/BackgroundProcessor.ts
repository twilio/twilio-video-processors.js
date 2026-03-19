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
    backgroundProcessorPipelineStub.setHysteresis.returns(new Promise<void>(resolve => resolve()));
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

  beforeEach(() => {
    consoleWarnStub.resetHistory();
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

  describe('hysteresis', () => {
    it('should default to enabled with default thresholds', () => {
      const processor = new MyBackgroundProcessor({ assetsPath: 'foo' });
      assert.deepStrictEqual(processor.hysteresis, { high: HYSTERESIS_HIGH, low: HYSTERESIS_LOW });
    });

    it('should accept true to enable with defaults', () => {
      const processor = new MyBackgroundProcessor({ assetsPath: 'foo', hysteresis: true });
      assert.deepStrictEqual(processor.hysteresis, { high: HYSTERESIS_HIGH, low: HYSTERESIS_LOW });
    });

    it('should accept false to disable', () => {
      const processor = new MyBackgroundProcessor({ assetsPath: 'foo', hysteresis: false });
      assert.strictEqual(processor.hysteresis, false);
    });

    it('should accept a config object with custom thresholds', () => {
      const processor = new MyBackgroundProcessor({ assetsPath: 'foo', hysteresis: { high: 200, low: 50 } });
      assert.deepStrictEqual(processor.hysteresis, { high: 200, low: 50 });
    });

    it('should update via setter with false', () => {
      const processor = new MyBackgroundProcessor({ assetsPath: 'foo' });
      processor.hysteresis = false;
      assert.strictEqual(processor.hysteresis, false);
    });

    it('should update via setter with config object', () => {
      const processor = new MyBackgroundProcessor({ assetsPath: 'foo' });
      processor.hysteresis = { high: 220, low: 30 };
      assert.deepStrictEqual(processor.hysteresis, { high: 220, low: 30 });
    });

    it('should update via setter with true to reset to defaults', () => {
      const processor = new MyBackgroundProcessor({ assetsPath: 'foo', hysteresis: { high: 220, low: 30 } });
      processor.hysteresis = true;
      assert.deepStrictEqual(processor.hysteresis, { high: HYSTERESIS_HIGH, low: HYSTERESIS_LOW });
    });

    it('should warn and use defaults when low >= high', () => {
      const processor = new MyBackgroundProcessor({ assetsPath: 'foo' });
      processor.hysteresis = { high: 50, low: 100 };
      assert.deepStrictEqual(processor.hysteresis, { high: HYSTERESIS_HIGH, low: HYSTERESIS_LOW });
      assert(consoleWarnStub.calledWith('hysteresis.low must be less than hysteresis.high. Using defaults.'));
    });

    it('should warn and use defaults when low equals high', () => {
      const processor = new MyBackgroundProcessor({ assetsPath: 'foo' });
      processor.hysteresis = { high: 100, low: 100 };
      assert.deepStrictEqual(processor.hysteresis, { high: HYSTERESIS_HIGH, low: HYSTERESIS_LOW });
      assert(consoleWarnStub.calledWith('hysteresis.low must be less than hysteresis.high. Using defaults.'));
    });

    it('should warn and use defaults for out-of-range thresholds (above 255)', () => {
      const processor = new MyBackgroundProcessor({ assetsPath: 'foo' });
      processor.hysteresis = { high: 300, low: 50 };
      assert.deepStrictEqual(processor.hysteresis, { high: HYSTERESIS_HIGH, low: HYSTERESIS_LOW });
      assert(consoleWarnStub.calledWith('Hysteresis thresholds must be between 0 and 255. Using defaults.'));
    });

    it('should warn and use defaults for negative thresholds', () => {
      const processor = new MyBackgroundProcessor({ assetsPath: 'foo' });
      processor.hysteresis = { high: 200, low: -1 };
      assert.deepStrictEqual(processor.hysteresis, { high: HYSTERESIS_HIGH, low: HYSTERESIS_LOW });
      assert(consoleWarnStub.calledWith('Hysteresis thresholds must be between 0 and 255. Using defaults.'));
    });

    it('should accept boundary thresholds { high: 255, low: 0 }', () => {
      const processor = new MyBackgroundProcessor({ assetsPath: 'foo', hysteresis: { high: 255, low: 0 } });
      assert.deepStrictEqual(processor.hysteresis, { high: 255, low: 0 });
    });

    it('should warn and use defaults for NaN thresholds', () => {
      const processor = new MyBackgroundProcessor({ assetsPath: 'foo' });
      processor.hysteresis = { high: NaN, low: 50 } as any;
      assert.deepStrictEqual(processor.hysteresis, { high: HYSTERESIS_HIGH, low: HYSTERESIS_LOW });
      assert(consoleWarnStub.calledWith('Invalid hysteresis thresholds. Using defaults.'));
    });

    it('should warn and use defaults for Infinity thresholds', () => {
      const processor = new MyBackgroundProcessor({ assetsPath: 'foo' });
      processor.hysteresis = { high: Infinity, low: 50 } as any;
      assert.deepStrictEqual(processor.hysteresis, { high: HYSTERESIS_HIGH, low: HYSTERESIS_LOW });
      assert(consoleWarnStub.calledWith('Invalid hysteresis thresholds. Using defaults.'));
    });

    it('should warn and use defaults for invalid type', () => {
      const processor = new MyBackgroundProcessor({ assetsPath: 'foo' });
      processor.hysteresis = 'invalid' as any;
      assert.deepStrictEqual(processor.hysteresis, { high: HYSTERESIS_HIGH, low: HYSTERESIS_LOW });
      assert(consoleWarnStub.calledWith('Invalid hysteresis value. Using defaults.'));
    });

    it('should warn and use defaults for null', () => {
      const processor = new MyBackgroundProcessor({ assetsPath: 'foo' });
      processor.hysteresis = null as any;
      assert.deepStrictEqual(processor.hysteresis, { high: HYSTERESIS_HIGH, low: HYSTERESIS_LOW });
      assert(consoleWarnStub.calledWith('Invalid hysteresis value. Using defaults.'));
    });

    it('should warn and use defaults for invalid type via constructor', () => {
      const processor = new MyBackgroundProcessor({ assetsPath: 'foo', hysteresis: 42 as any });
      assert.deepStrictEqual(processor.hysteresis, { high: HYSTERESIS_HIGH, low: HYSTERESIS_LOW });
      assert(consoleWarnStub.calledWith('Invalid hysteresis value. Using defaults.'));
    });

    it('should call pipeline when value changes', () => {
      const processor = new MyBackgroundProcessor({ assetsPath: 'foo' });
      const pipeline = (processor as any)._backgroundProcessorPipeline;
      pipeline.setHysteresis.resetHistory();
      processor.hysteresis = false;
      assert.strictEqual(pipeline.setHysteresis.callCount, 1);
      assert(pipeline.setHysteresis.calledWith(false));
    });

    it('should not call pipeline when value has not changed', () => {
      const processor = new MyBackgroundProcessor({ assetsPath: 'foo' });
      const pipeline = (processor as any)._backgroundProcessorPipeline;
      pipeline.setHysteresis.resetHistory();
      processor.hysteresis = true;
      assert.strictEqual(pipeline.setHysteresis.callCount, 0);
    });

    it('should not call pipeline when setting false twice', () => {
      const processor = new MyBackgroundProcessor({ assetsPath: 'foo', hysteresis: false });
      const pipeline = (processor as any)._backgroundProcessorPipeline;
      pipeline.setHysteresis.resetHistory();
      processor.hysteresis = false;
      assert.strictEqual(pipeline.setHysteresis.callCount, 0);
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

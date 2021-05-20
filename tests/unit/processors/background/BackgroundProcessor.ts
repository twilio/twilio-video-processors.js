import * as assert from 'assert';
import * as sinon from 'sinon';
import { BackgroundProcessor } from '../../../../lib/processors/background/BackgroundProcessor';
import {
  INFERENCE_CONFIG,
  WASM_INFERENCE_DIMENSIONS,
  BODYPIX_INFERENCE_DIMENSIONS,
  MASK_BLUR_RADIUS,
  HISTORY_COUNT,
  PERSON_PROBABILITY_THRESHOLD,
} from '../../../../lib/constants';

class MyBackgroundProcessor extends BackgroundProcessor {
  constructor(options?: any) {
    super(options);
  }
  protected _setBackground(inputFrame: OffscreenCanvas): void {
    
  }
}

describe('BackgroundProcessor', () => {
  let consoleWarnStub: any;
  let loadModel: any;
  before(() => {
    loadModel = sinon.stub();
    (BackgroundProcessor as any)._loadModel = loadModel;
    consoleWarnStub = sinon.stub(console, 'warn');
  });

  after(() => {
    consoleWarnStub.restore();
  });

  it('should throw an error if options is not provided', () => {
    assert.throws(() => new MyBackgroundProcessor());
  });

  describe('modelUrl', () => {
    [
      null,
      undefined,
      ''
    ].forEach((value: any) => {
      it(`should throw if modelUrl param is ${value}`, () => {
        assert.throws(() => new MyBackgroundProcessor({ modelUrl: value }));
      });
    });

    it(`should set modelUrl`, () => {
      const processor: any = new MyBackgroundProcessor({ modelUrl: 'foo' });
      assert.strictEqual(processor._modelUrl, 'foo');
    });
  });

  describe('maskBlurRadius', () => {
    [
      null, 
      undefined, 
      { }, 
      { maskBlurRadius: null },
      { maskBlurRadius: undefined },
      { maskBlurRadius: 0 },
      { maskBlurRadius: 1 },
      { maskBlurRadius: 2 }
    ].forEach((option: any) => {
      const useDefault = !option || typeof option.maskBlurRadius !== 'number';
      const param = option ? JSON.stringify(option) : option;
      it(`should set maskBlurRadius to ${useDefault ? 'default' : option.maskBlurRadius} if option is ${param}`, () => {
        const processor = new MyBackgroundProcessor({ ...option, modelUrl: 'foo' });
        const expected = useDefault ? MASK_BLUR_RADIUS : option.maskBlurRadius;
        assert.strictEqual(processor.maskBlurRadius, expected);
      });
  
      if (option) {
        it(`should set maskBlurRadius to ${useDefault ? 'default' : option.maskBlurRadius} if maskBlurRadius being set is ${option.blurFilterRadius}`, () => {
          const processor = new MyBackgroundProcessor({ modelUrl: 'foo' });
          processor.maskBlurRadius = option.maskBlurRadius;
          const expected = useDefault ? MASK_BLUR_RADIUS : option.maskBlurRadius;
          assert.strictEqual(processor.maskBlurRadius, expected);
        });
      }
    });
  });

  describe('personProbabilityThreshold', () => {
    [
      null,
      undefined,
      { },
      { personProbabilityThreshold: null },
      { personProbabilityThreshold: undefined },
      { personProbabilityThreshold: 0 },
      { personProbabilityThreshold: 1 },
      { personProbabilityThreshold: 0.5 }
    ].forEach((option: any) => {
      const useDefault = !option || !option.personProbabilityThreshold;
      const param = option ? JSON.stringify(option) : option;
      it(`should set personProbabilityThreshold to ${useDefault ? 'default' : option.personProbabilityThreshold} if option is ${param}`, () => {
        const processor:any = new MyBackgroundProcessor({ ...option, modelUrl: 'foo' });
        const expected = useDefault ? PERSON_PROBABILITY_THRESHOLD : option.personProbabilityThreshold;
        assert.strictEqual(processor._personProbabilityThreshold, expected);
      });
    });
  });

  describe('historyCount', () => {
    [
      null,
      undefined,
      { },
      { historyCount: null },
      { historyCount: undefined },
      { historyCount: 0 },
      { historyCount: 1 },
      { historyCount: 2 }
    ].forEach((option: any) => {
      const useDefault = !option || !option.historyCount || option.historyCount < 1;
      const param = option ? JSON.stringify(option) : option;
      it(`should set historyCount to ${useDefault ? 'default' : option.historyCount} if option is ${param}`, () => {
        const processor:any = new MyBackgroundProcessor({ ...option, modelUrl: 'foo' });
        const expected = useDefault ? HISTORY_COUNT : option.historyCount;
        assert.strictEqual(processor._historyCount, expected);
      });
    });
  });

  describe('inferenceConfig', () => {
    [
      null, 
      undefined, 
      { }, 
      { inferenceConfig: null },
      { inferenceConfig: undefined },
      { inferenceConfig: {} },
      { inferenceConfig: { foo: 'foo' } }
    ].forEach((option: any) => {
      const useDefault = !option || !option.inferenceConfig;
      const param = option && option.inferenceConfig ? JSON.stringify(option) : option;
      it(`should set inferenceConfig to ${useDefault ? 'default' : option.inferenceConfig} if option is ${param}`, () => {
        const processor:any = new MyBackgroundProcessor({ ...option, modelUrl: 'foo' });
        const expected = useDefault ? INFERENCE_CONFIG : option.inferenceConfig;
        assert.deepStrictEqual(processor._inferenceConfig, expected);
      });
    });
  });

  describe('useWasm', () => {
    it('should set inferenceDimensions to wasm default if useWasm is true', () => {
      const processor:any = new MyBackgroundProcessor({ useWasm: true, modelUrl: 'foo' });
      assert.deepStrictEqual(processor._inferenceDimensions, WASM_INFERENCE_DIMENSIONS);
    });

    it('should set inferenceDimensions to wasm default if useWasm is not provided', () => {
      const processor:any = new MyBackgroundProcessor({ modelUrl: 'foo' });
      assert.deepStrictEqual(processor._inferenceDimensions, WASM_INFERENCE_DIMENSIONS);
    });

    it('should set inferenceDimensions to bodypix default if useWasm is false', () => {
      const processor:any = new MyBackgroundProcessor({ useWasm: false, modelUrl: 'foo' });
      assert.deepStrictEqual(processor._inferenceDimensions, BODYPIX_INFERENCE_DIMENSIONS);
    });
  });

  describe('inferenceDimensions', () => {
    [
      null, 
      undefined, 
      { }, 
      { inferenceDimensions: null },
      { inferenceDimensions: undefined },
      { inferenceDimensions: {} },
      { inferenceDimensions: { foo: 'foo' } },
      { inferenceDimensions: { height: 0, width: 1 } },
      { inferenceDimensions: { height: 1, width: 0 } },
      { inferenceDimensions: { height: 1, width: 1 } }
    ].forEach((option: any) => {
      const useDefault = !option || !option.inferenceDimensions;
      const param = option && option.inferenceDimensions ? JSON.stringify(option) : option;
      it(`should set inferenceDimensions to ${useDefault ? 'default' : option.inferenceDimensions} if option is ${param}`, () => {
        const processor:any = new MyBackgroundProcessor({ ...option, modelUrl: 'foo' });
        const expected = useDefault ? WASM_INFERENCE_DIMENSIONS : option.inferenceDimensions;
        assert.deepStrictEqual(processor._inferenceDimensions, expected);
      });
    });
  });
});

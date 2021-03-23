import * as assert from 'assert';
import * as sinon from 'sinon';
import { BackgroundProcessor } from '../../../../lib/processors/background/BackgroundProcessor';
import { INFERENCE_CONFIG, INFERENCE_DIMENSIONS } from '../../../../lib/constants';

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

  it('should call loadModel once after instantiation', () => {
    sinon.assert.notCalled(loadModel);
    const processor = new MyBackgroundProcessor();
    sinon.assert.calledOnce(loadModel);
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
      const useDefault = !option || !option.maskBlurRadius || option.maskBlurRadius < 1;
      const param = option ? JSON.stringify(option) : option;
      it(`should set maskBlurRadius to ${useDefault ? 'default' : option.maskBlurRadius} if option is ${param}`, () => {
        const processor = new MyBackgroundProcessor(option);
        const expected = useDefault ? 3 : option.maskBlurRadius;
        assert.strictEqual(processor.maskBlurRadius, expected);
      });
  
      if (option) {
        it(`should set maskBlurRadius to ${useDefault ? 'default' : option.maskBlurRadius} if maskBlurRadius being set is ${option.blurFilterRadius}`, () => {
          const processor = new MyBackgroundProcessor();
          processor.maskBlurRadius = option.maskBlurRadius;
          const expected = useDefault ? 3 : option.maskBlurRadius;
          assert.strictEqual(processor.maskBlurRadius, expected);
        });
      }
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
      const useDefault = !option || !option.inferenceConfig || !Object.keys(option.inferenceConfig).length;
      const param = option && option.inferenceConfig ? JSON.stringify(option) : option;
      it(`should set inferenceConfig to ${useDefault ? 'default' : option.inferenceConfig} if option is ${param}`, () => {
        const processor = new MyBackgroundProcessor(option);
        const expected = useDefault ? INFERENCE_CONFIG : option.inferenceConfig;
        assert.deepStrictEqual(processor.inferenceConfig, expected);
      });
  
      if (option) {
        it(`should set inferenceConfig to ${useDefault ? 'default' : option.inferenceConfig} if inferenceConfig being set is ${JSON.stringify(option.inferenceConfig)}`, () => {
          const processor = new MyBackgroundProcessor();
          processor.inferenceConfig = option.inferenceConfig;
          const expected = useDefault ? INFERENCE_CONFIG : option.inferenceConfig;
          assert.strictEqual(processor.inferenceConfig, expected);
        });
      }
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
      const useDefault = !option || !option.inferenceDimensions || !option.inferenceDimensions.height || !option.inferenceDimensions.width;
      const param = option && option.inferenceDimensions ? JSON.stringify(option) : option;
      it(`should set inferenceDimensions to ${useDefault ? 'default' : option.inferenceDimensions} if option is ${param}`, () => {
        const processor = new MyBackgroundProcessor(option);
        const expected = useDefault ? INFERENCE_DIMENSIONS : option.inferenceDimensions;
        assert.deepStrictEqual(processor.inferenceDimensions, expected);
      });
  
      if (option) {
        it(`should set inferenceDimensions to ${useDefault ? 'default' : option.inferenceDimensions} if inferenceDimensions being set is ${JSON.stringify(option.inferenceDimensions)}`, () => {
          const processor = new MyBackgroundProcessor();
          processor.inferenceDimensions = option.inferenceDimensions;
          const expected = useDefault ? INFERENCE_DIMENSIONS : option.inferenceDimensions;
          assert.strictEqual(processor.inferenceDimensions, expected);
        });
      }
    });
  });
});

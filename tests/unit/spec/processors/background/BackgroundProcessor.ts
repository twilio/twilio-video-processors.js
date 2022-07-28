import * as assert from 'assert';
import * as sinon from 'sinon';
import { BackgroundProcessor } from '../../../../../lib/processors/background/BackgroundProcessor';
import {
  WASM_INFERENCE_DIMENSIONS,
  MASK_BLUR_RADIUS,
  PERSON_PROBABILITY_THRESHOLD,
} from '../../../../../lib/constants';
import { WebGL2PipelineType } from '../../../../../lib/types';

class MyBackgroundProcessor extends BackgroundProcessor {
  constructor(options?: any) {
    super(options);
  }
  protected _setBackground(inputFrame: OffscreenCanvas): void {
    
  }
  protected _getWebGL2PipelineType(): WebGL2PipelineType {
    return WebGL2PipelineType.Blur;
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

  describe('createPersonMask', () => {
    let processor: any;

    beforeEach(() => {
      processor = new MyBackgroundProcessor({ assetsPath: '' });
      processor._getResizedInputImageData = sinon.stub();
      processor._runTwilioTfLiteInference = sinon.stub();
    });

    it('should not run image resizing step when on debounced mode', () => {
      processor._createPersonMask();
      processor._createPersonMask();
      sinon.assert.calledOnce(processor._getResizedInputImageData);
    });

    it('should run image resizing step when not on debounced mode', () => {
      processor._createPersonMask();
      sinon.assert.calledOnce(processor._getResizedInputImageData);
      processor._createPersonMask();
      sinon.assert.calledOnce(processor._getResizedInputImageData);
    });

    it('should not run inference step when on debounced mode', () => {
      processor._createPersonMask();
      processor._createPersonMask();
      sinon.assert.calledOnce(processor._runTwilioTfLiteInference);
    });

    it('should run inference step when not on debounced mode', () => {
      processor._createPersonMask();
      sinon.assert.calledOnce(processor._runTwilioTfLiteInference);
      processor._createPersonMask();
      sinon.assert.calledOnce(processor._runTwilioTfLiteInference);
    });
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

    it(`should set assetsPath for empty string`, () => {
      const processor: any = new MyBackgroundProcessor({ assetsPath: '' });
      assert.strictEqual(processor._assetsPath, '');
    });

    it(`should set assetsPath for website root folder`, () => {
      const processor: any = new MyBackgroundProcessor({ assetsPath: '/' });
      assert.strictEqual(processor._assetsPath, '/');
    });

    it(`should set assetsPath for non-empty string and if path does not ends in /`, () => {
      const processor: any = new MyBackgroundProcessor({ assetsPath: 'https://foo' });
      assert.strictEqual(processor._assetsPath, 'https://foo/');
    });

    it(`should set assetsPath for non-empty string and if path ends in /`, () => {
      const processor: any = new MyBackgroundProcessor({ assetsPath: 'https://foo/' });
      assert.strictEqual(processor._assetsPath, 'https://foo/');
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
        const processor:any = new MyBackgroundProcessor({ ...option, assetsPath: 'foo' });
        const expected = useDefault ? PERSON_PROBABILITY_THRESHOLD : option.personProbabilityThreshold;
        assert.strictEqual(processor._personProbabilityThreshold, expected);
      });
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
        const processor:any = new MyBackgroundProcessor({ ...option, assetsPath: 'foo' });
        const expected = useDefault ? WASM_INFERENCE_DIMENSIONS : option.inferenceDimensions;
        assert.deepStrictEqual(processor._inferenceDimensions, expected);
      });
    });
  });
});

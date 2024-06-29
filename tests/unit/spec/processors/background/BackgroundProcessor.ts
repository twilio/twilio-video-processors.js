import * as assert from 'assert';
import * as sinon from 'sinon';
import { BackgroundProcessor } from '../../../../../lib/processors/background/BackgroundProcessor';
import {
  WASM_INFERENCE_DIMENSIONS,
  MASK_BLUR_RADIUS,
} from '../../../../../lib/constants';
import { TwilioTFLite } from '../../../../../lib/utils/TwilioTFLite';
import { WebGL2PipelineType } from '../../../../../lib/types';

class MyBackgroundProcessor extends BackgroundProcessor {
  tflite: TwilioTFLite;

  constructor(options?: any) {
    super(options);
    // @ts-ignore
    BackgroundProcessor._tflite = new TwilioTFLite();
    // @ts-ignore
    this.tflite = BackgroundProcessor._tflite;
  }

  protected _getWebGL2PipelineType(): WebGL2PipelineType {
    return WebGL2PipelineType.Blur;
  }

  protected _setBackground(inputFrame: OffscreenCanvas): void {
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

  describe('createPersonMask', () => {
    let processor: any;
    let runInference: any;
    let tflite: any;

    [true, false].forEach((debounce) => {
      describe(`when ${debounce ? '' : 'not '}in debounce mode`, () => {
        beforeEach(async () => {
          processor = new MyBackgroundProcessor({
            assetsPath: '',
            debounce
          });
          processor._currentMask = null;
          processor._resizeInputFrame = sinon.stub();
          tflite = processor.tflite!;
          runInference = sinon.stub(tflite, 'runInference').returns(new ImageData(1, 1));
          runInference.resetHistory();
          const personMask = await processor._createPersonMask();
          if (debounce) {
            processor._currentMask = personMask;
          }
        });

        it(`should run resizing and inference steps for the current input frame and ${debounce ? 'not ' : ''}the next input frame`, async () => {
          sinon.assert.calledOnce(processor._resizeInputFrame);
          sinon.assert.calledOnce(runInference);
          processor._resizeInputFrame.resetHistory();
          runInference.resetHistory();
          await processor._createPersonMask();
          if (debounce) {
            sinon.assert.notCalled(processor._resizeInputFrame);
            sinon.assert.notCalled(runInference);

          } else {
            sinon.assert.calledOnce(processor._resizeInputFrame);
            sinon.assert.calledOnce(runInference);
          }
        });
      });
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

  describe('debounce', () => {
    [
      null,
      undefined,
      {},
      { debounce: true },
      { debounce: false }
    ].forEach((option: any) => {
      const useDefault = !option || !('debounce' in option);
      const param = option ? JSON.stringify(option) : option;
      it(`should set debounce to ${useDefault ? 'default' : option.debounce} if option is ${param}`, () => {
        const processor: any = new MyBackgroundProcessor({ ...option, assetsPath: 'foo' });
        const expected = useDefault ? false : option.debounce;
        assert.deepStrictEqual(processor._debounce, expected);
      });
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

  describe('pipeline', () => {
    [
      null,
      undefined,
      {},
      { pipeline: 'Canvas2D' },
      { pipeline: 'WebGL2' }
    ].forEach((option: any) => {
      const useDefault = !option || !('pipeline' in option);
      const param = option ? JSON.stringify(option) : option;
      it(`should set pipeline to ${useDefault ? 'default' : option.pipeline} if option is ${param}`, () => {
        const processor: any = new MyBackgroundProcessor({ ...option, assetsPath: 'foo' });
        const expected = useDefault ? 'WebGL2' : option.pipeline;
        assert.deepStrictEqual(processor._pipeline, expected);
      });
    });
  });

  describe('inferenceDimensions', () => {
    [
      null,
      undefined,
      {},
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
        const processor: any = new MyBackgroundProcessor({ ...option, assetsPath: 'foo' });
        const expected = useDefault ? WASM_INFERENCE_DIMENSIONS : option.inferenceDimensions;
        assert.deepStrictEqual(processor._inferenceDimensions, expected);
      });
    });
  });
});

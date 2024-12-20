import * as assert from 'assert';
import * as sinon from 'sinon';
import { VirtualBackgroundProcessor } from '../../../../../lib';

describe('VirtualBackgroundProcessor', () => {
  let consoleWarnStub: any;
  before(() => {
    consoleWarnStub = sinon.stub(console, 'warn');
  });

  after(() => {
    consoleWarnStub.restore();
  });

  describe('backgroundImage', () => {
    [
      null,
      undefined,
      { },
      { complete: true, naturalHeight: 0 },
      { complete: true, naturalHeight: 1 }
    ].forEach((img: any) => {
      const shouldThrow = !img || !img.complete || !img.naturalHeight;
      it(`should ${shouldThrow ? 'throw an error' : 'set the image'} if the image provided in the constructor is ${JSON.stringify(img)}`, () => {
        if (shouldThrow) {
          assert.throws(() => {
            const processor = new VirtualBackgroundProcessor({ backgroundImage: img, assetsPath: 'foo' });
          });
        } else {
          const processor = new VirtualBackgroundProcessor({ backgroundImage: img, assetsPath: 'foo' });
          assert.deepStrictEqual(processor.backgroundImage, img);
        }
      });

      it(`should ${shouldThrow ? 'throw an error' : 'set the image'} if the image provided in the setter is ${JSON.stringify(img)}`, () => {
        const processor = new VirtualBackgroundProcessor({ assetsPath: 'foo', backgroundImage: { complete: true, naturalHeight: 1 } } as any);
        if (shouldThrow) {
          assert.throws(() => {
            processor.backgroundImage = img;
          });
        } else {
          processor.backgroundImage = img;
          assert.deepStrictEqual(processor.backgroundImage, img);
        }
      });
    });
  });

  describe('fitType', () => {
    const options = { assetsPath: 'foo', backgroundImage: { complete: true, naturalHeight: 1 }} as any;
    const validTypes = ['Contain', 'Cover', 'Fill', 'None'];
    [null, undefined, 'foo', ...validTypes].forEach((type: any) => {
      const isValid = validTypes.includes(type);
      it(`should set to ${isValid ? type : '"Fill(default)'} if fitType in the constructor is ${type}`, () => {
        const processor = new VirtualBackgroundProcessor({...options, fitType: type});
        assert.strictEqual(processor.fitType, isValid ? type : 'Fill');
      });

      it(`should set to ${isValid ? type : '"Fill(default)'} if fitType in the setter is ${type}`, () => {
        const processor = new VirtualBackgroundProcessor(options);
        processor.fitType = type;
        assert.strictEqual(processor.fitType, isValid ? type : 'Fill');
      });
    });
  });

  describe('_getFitPosition', () => {
    const options = { assetsPath: 'foo', backgroundImage: { complete: true, naturalHeight: 1 }, useWebWorker: false } as any;
    let processor: VirtualBackgroundProcessor;

    beforeEach(() => {
      processor = new VirtualBackgroundProcessor(options);
    });

    [{
      input: [1280, 720, 1280, 720, 'Cover'],
      expected: { x: 0, y: 0, w: 1280, h: 720 }
    },{
      input: [1280 * 1.5, 720 * 1.5, 1280, 720, 'Cover'],
      expected: { x: 0, y: 0, w: 1280, h: 720 }
    },{
      input: [1280 * 0.5, 720 * 0.5, 1280, 720, 'Cover'],
      expected: { x: 0, y: 0, w: 1280, h: 720 }
    },{
      input: [800, 200, 1280, 720, 'Cover'],
      expected: { x: -800, y: 0, w: 2880, h: 720 }
    },{
      input: [200, 800, 1280, 720, 'Cover'],
      expected: { x: 0, y: -2200, w: 1280, h: 5120 }
    },{
      input: [1280, 720, 1280, 720, 'Contain'],
      expected: { x: 0, y: 0, w: 1280, h: 720 }
    },{
      input: [1280 * 1.5, 720 * 1.5, 1280, 720, 'Contain'],
      expected: { x: 0, y: 0, w: 1280, h: 720 }
    },{
      input: [1280 * 0.5, 720 * 0.5, 1280, 720, 'Contain'],
      expected: { x: 0, y: 0, w: 1280, h: 720 }
    },{
      input: [800, 200, 1280, 720, 'Contain'],
      expected: { x: 0, y: 200, w: 1280, h: 320 }
    },{
      input: [200, 800, 1280, 720, 'Contain'],
      expected: { x: 550, y: 0, w: 180, h: 720 }
    }].forEach(({ input, expected }) => {
      it(`should return correct position when parameters are ${JSON.stringify(input)}`, () => {
        // @ts-ignore
        const output = (processor._backgroundProcessorPipeline._getFitPosition as any)(...input);
        assert.deepStrictEqual(output, expected);
      });
    });
  });
});

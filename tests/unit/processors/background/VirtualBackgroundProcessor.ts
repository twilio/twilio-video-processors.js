import * as assert from 'assert';
import * as sinon from 'sinon';
import { VirtualBackgroundProcessor } from '../../../../lib/processors/background/VirtualBackgroundProcessor';

describe('VirtualBackgroundProcessor', () => {
  let consoleWarnStub: any;
  before(() => {
    consoleWarnStub = sinon.stub(console, 'warn');
  });

  after(() => {
    consoleWarnStub.restore();
  });

  it('should throw an error if options is not provided', () => {
    assert.throws(() => new (VirtualBackgroundProcessor as any)());
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
            const processor = new VirtualBackgroundProcessor({ backgroundImage: img });
          });
        } else {
          const processor = new VirtualBackgroundProcessor({ backgroundImage: img });
          assert.deepStrictEqual(processor.backgroundImage, img);
        }
      });

      it(`should ${shouldThrow ? 'throw an error' : 'set the image'} if the image provided in the setter is ${JSON.stringify(img)}`, () => {
        const processor = new VirtualBackgroundProcessor({ backgroundImage: { complete: true, naturalHeight: 1 } } as any);
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
    const options = { backgroundImage: { complete: true, naturalHeight: 1 }} as any;
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
});

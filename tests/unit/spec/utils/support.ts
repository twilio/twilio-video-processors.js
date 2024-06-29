import * as assert from 'assert';
import { isBrowserSupported } from '../../../../lib/utils/support';

describe('isSupported', () => {
  const root = global as any;

  describe('For client side', () => {
    describe('with OffscreenCanvas', () => {
      let originalOffscreenCanvas: any;
      let getContext: any;

      beforeEach(() => {
        originalOffscreenCanvas = root.OffscreenCanvas;
        root.OffscreenCanvas = OffscreenCanvas;
      });

      afterEach(() => {
        root.OffscreenCanvas = originalOffscreenCanvas;
      });

      class OffscreenCanvas {
        getContext(type: string) {
          return getContext(type);
        }
      }

      it('it should return true if 2d is supported', () => {
        getContext = (type: string) => type === '2d';
        assert.strictEqual(isBrowserSupported(), true);
      });

      it('it should return true if 2d is not supported but webgl2 is supported', () => {
        getContext = (type: string) => type === 'webgl2';
        assert.strictEqual(isBrowserSupported(), true);
      });

      it('it should return false if 2d and webgl2 are not supported', () => {
        getContext = (type: string) => null;
        assert.strictEqual(isBrowserSupported(), false);
      });
    });

    describe('without OffscreenCanvas', () => {
      let originalOffscreenCanvas: any;
      let originalDocument: any;
      let getContext: any;

      beforeEach(() => {
        originalOffscreenCanvas = root.OffscreenCanvas;
        delete root.OffscreenCanvas;
        originalDocument = root.document;
        root.document = {
          createElement: () => {
            return ({
              getContext: (type: string) => {
                return getContext(type);
              }
            });
          }
        };
      });

      afterEach(() => {
        root.OffscreenCanvas = originalOffscreenCanvas;
        root.document = originalDocument;
      });

      it('it should return true if 2d is supported', () => {
        getContext = (type: string) => type === '2d';
        assert.strictEqual(isBrowserSupported(), true);
      });

      it('it should return true if 2d is not supported but webgl2 is supported', () => {
        getContext = (type: string) => type === 'webgl2';
        assert.strictEqual(isBrowserSupported(), true);
      });

      it('it should return false if 2d and webgl2 are not supported', () => {
        getContext = (type: string) => null;
        assert.strictEqual(isBrowserSupported(), false);
      });
    });
  });

  describe('For server side rendering', () => {
    let originalWindow: any;

    before(() => {
      originalWindow = root.window;
      delete root.window;
    });

    after(() => {
      root.window = originalWindow;
    });

    it('should return false.', () => {
      assert.strictEqual(isBrowserSupported(), false);
    });
  });
});


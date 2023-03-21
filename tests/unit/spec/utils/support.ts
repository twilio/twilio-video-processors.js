import * as assert from 'assert';
import * as sinon from 'sinon';
import { isBrowserSupported } from '../../../../lib/utils/support';

describe('isSupported', () => {
  const root = global as any;

  describe('For client side', () => {
    describe('with offscreencanvas', () => {
      let originalOffscreenCanvas: any;
      let getContext: any;

      beforeEach(() => {
        originalOffscreenCanvas = root.window.OffscreenCanvas;
        root.window.OffscreenCanvas = OffscreenCanvas;
      });

      afterEach(() => {
        root.window.OffscreenCanvas = originalOffscreenCanvas;
      });

      class OffscreenCanvas {
        constructor(){}
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

    describe('without offscreencanvas', () => {
      let originalOffscreenCanvas: any;
      let originalDocument: any;
      let mockDocument: any;
      let getContext: any;

      beforeEach(() => {
        originalOffscreenCanvas = root.window.OffscreenCanvas;
        delete root.window.OffscreenCanvas;
        originalDocument = root.document;

        mockDocument = {
          createElement: () => {
            return ({
              getContext: (type: string) => {
                return getContext(type);
              }
            });
          }
        };
        root.document = mockDocument;
      });

      afterEach(() => {
        root.window.OffscreenCanvas = originalOffscreenCanvas;
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


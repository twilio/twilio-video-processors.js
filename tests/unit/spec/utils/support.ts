import * as assert from 'assert';
import { isBrowserSupported } from '../../../../lib/utils/support';

describe('isSupported', () => {
  const root = global as any;
  [
    [
      'Chrome on Desktop',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/77.0.3865.90 Safari/537.36',
      () => {},
      {},
      true
    ],
    [
      'Headless Chrome',
      'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/81.0.4044.0 Safari/537.36',
      () => {},
      {},
      true
    ],
    [
      'Safari on Mac',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_6) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13 Safari/605.1.15',
      null,
      null,
      false
    ],
    [
      'Firefox on Mac',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.13; rv:61.0) Gecko/20100101 Firefox/69.0',
      null,
      null,
      false
    ],
    [
      'Edge (Chromium)',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64; Xbox; Xbox One) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/52.0.2743.116 Safari/537.36 Edg/15.15063',
      () => {},
      {},
      true
    ],
    [
      'Desktop Brave',
      'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Brave Chrome/78.0.3904.108 Safari/537.36',
      () => {},
      {},
      true
    ],
    [
      'Electron',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/66.0.3359.181 Electron/3.1.12 Safari/537.36',
      () => {},
      {},
      true
    ],
    [
      'Samsung Browser',
      'Mozilla/5.0 (Linux; Android 9; SAMSUNG SM-G950U) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/10.2 Chrome/71.0.3578.99 Mobile Safari/537.36',
      null,
      null,
      false
    ],
    [
      'Safari on iPhone',
      'Mozilla/5.0 (iPhone; CPU iPhone OS 12_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13 Mobile/15E148 Safari/604.1',
      null,
      null,
      false
    ],
    [
      'Moto G7 Android Chrome',
      'Mozilla/5.0 (Linux; Android 9; moto g(7) power) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.96 Mobile Safari/537.36',
      () => {},
      {},
      false
    ],
    [
      'Brave on Android',
      'Mozilla/5.0 (Linux; Android 9; ONEPLUS A6013) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.157 Mobile Safari/537.36 Brave/74',
      () => {},
      {},
      false
    ],
    [
      'Firefox on Android',
      'Mozilla/5.0 (Android 7.0; Mobile; rv:54.0) Gecko/54.0 Firefox/54.0',
      null,
      null,
      false
    ],
    [
      'Firefox on iPhone',
      'Mozilla/5.0 (iPhone; CPU OS 14_4_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) FxiOS/33.1 Mobile/15E148 Safari/605.1.15',
      null,
      null,
      false
    ],
    [
      'Edge on Android',
      'Mozilla/5.0 (Linux; Android 10; HD1913) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.77 Mobile Safari/537.36 EdgA/46.3.4.5155',
      () => {},
      {},
      false
    ],
    [
      'Edge on iPhone',
      'Mozilla/5.0 (iPhone; CPU iPhone OS 14_4_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 EdgiOS/46.3.13 Mobile/15E148 Safari/605.1.15',
      null,
      null,
      false
    ],
    [
      'Chrome on iPhone',
      'Mozilla/5.0 (iPhone; CPU iPhone OS 14_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/90.0.4430.216 Mobile/15E148 Safari/604.1',
      () => {},
      {},
      false
    ],
    [
      'Brave on iPhone',
      'Mozilla/5.0 (iPhone; CPU iPhone OS 14_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0.2 Mobile/15E148 Safari/604.1',
      null,
      null,
      false
    ],
  ].forEach(([browser, userAgent, OffscreenCanvas, chrome, expectedResult]) => {
    describe(`For ${browser}`, () => {
      let originalAgent: string;
      let originalChrome: string;
      let originalOffscreenCanvas: null;

      beforeEach(() => {
        originalAgent = root.window.navigator.userAgent;
        originalChrome = root.window.chrome;

        root.window.navigator.userAgent = userAgent;
        root.window.chrome = chrome;
        root.window.OffscreenCanvas = OffscreenCanvas;
      });

      afterEach(() => {
        root.window.navigator.userAgent = originalAgent;
        root.window.chrome = originalChrome;
        root.window.OffscreenCanvas = originalOffscreenCanvas;
      });

      it(`should return ${expectedResult}.`, () => {
        assert.strictEqual(isBrowserSupported(), expectedResult);
      });
    });
  });

  describe('For server', () => {
    let originalWindow: any;

    beforeEach(() => {
      originalWindow = root.window;
      root.window = undefined;
    });

    afterEach(() => {
      root.window = originalWindow;
    })

    it('should return false', () => {
      assert.strictEqual(isBrowserSupported(), false);
    });
  });
});

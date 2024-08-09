import * as assert from 'assert';
import * as VideoProcessors from '../../../lib';
import { GaussianBlurBackgroundProcessorOptions, VirtualBackgroundProcessorOptions } from '../../../lib';

describe('exports', () => {
  context('interfaces', () => {
    it('should export GaussianBlurBackgroundProcessorOptions', () => {
      let options: GaussianBlurBackgroundProcessorOptions;
      options = {
        assetsPath: 'foo',
        blurFilterRadius: 1,
        maskBlurRadius: 1,
      };
    });
    it('should export VirtualBackgroundProcessorOptions', () => {
      let options: VirtualBackgroundProcessorOptions;
      options = {
        assetsPath: 'foo',
        backgroundImage: new Image(),
        fitType: VideoProcessors.ImageFit.Contain,
        maskBlurRadius: 1,
      };
    });
  });

  context('non-interface', () => {
    const propertyNames = [
      'GaussianBlurBackgroundProcessor',
      'ImageFit',
      'isSupported',
      'version',
      'VirtualBackgroundProcessor'
    ];
    let moduleExports: any;
    let windowExports: any;

    beforeEach(() => {
      moduleExports = {...VideoProcessors};
      windowExports = {...window.Twilio.VideoProcessors};
    });

    it('should have correct exports', () => {
      propertyNames.forEach((prop: string) => {
        assert(typeof moduleExports[prop] !== 'undefined');
        assert(typeof windowExports[prop] !== 'undefined');
      });
    });

    it('should not have additional exports', () => {
      propertyNames.forEach((prop: string) => {
        delete moduleExports[prop];
        delete windowExports[prop];
      });

      assert.strictEqual(Object.keys(moduleExports).length, 0);
      assert.strictEqual(Object.keys(windowExports).length, 0);
    });
  });
});

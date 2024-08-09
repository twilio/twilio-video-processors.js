import * as assert from 'assert';
import { GaussianBlurBackgroundProcessor, GaussianBlurBackgroundProcessorOptions } from '../../../lib';
import { compareImages, getImageFromCanvas, loadImage } from '../util';

describe('GaussianBlurBackgroundProcessor', function() {
  this.timeout(60000);

  it('should create instance', async () => {
    const options: GaussianBlurBackgroundProcessorOptions = {
      assetsPath: '',
      blurFilterRadius: 10,
      maskBlurRadius: 3,
      useWebWorker: false
    };
    const processor = new GaussianBlurBackgroundProcessor(options);
    assert.strictEqual(processor.blurFilterRadius, 10);
    assert.strictEqual(processor.maskBlurRadius, 3);
  });

  describe('should render correct output', async () => {
    const runTest = async (options?: any) => {
      options = options || {};
      const inputCanvas = new OffscreenCanvas(1, 1);
      const outputCanvas = document.createElement('canvas');
      const inputImage = await loadImage('/images/input/input_person.jpg');

      inputCanvas.height = inputImage.height;
      inputCanvas.width = inputImage.width;
      outputCanvas.height = inputImage.height;
      outputCanvas.width = inputImage.width;
      inputCanvas.getContext('2d')!.drawImage(inputImage, 0, 0);

      const processor = new GaussianBlurBackgroundProcessor({
        ...options,
        assetsPath: '/assets',
        useWebWorker: false
      });

      await processor.loadModel();

      const processCount = options.processCount || 1;
      await new Promise(resolve => {
        let counter = 0;
        const render = () => {
          if (counter >= processCount) {
            return resolve(null);
          }
          processor.processFrame(inputCanvas, outputCanvas).then(() => {
            counter++;
            setTimeout(render, 0);
          });
        };
        render();
      });
      return getImageFromCanvas(outputCanvas);
    };

    [{
      name: 'using default configuration',
      expectedImageName: 'blur_default',
    },{
      name: 'using non default blurFilterRadius',
      expectedImageName: 'blur_filter_radius_30',
      options: { blurFilterRadius: 30 },
    },{
      name: 'using non default maskBlurRadius',
      expectedImageName: 'blur_mask_blur_100',
      options: { maskBlurRadius: 100 },
    }].forEach(({ name, options, expectedImageName }) => {
      it(`when ${name}`, async () => {
        const outputImageResult = await runTest(options);
        const expectedOutputImage = await loadImage(`/images/output/${expectedImageName}.png`);
        const Rembrandt = (window as any).Rembrandt;
        // WebGL renders pixels with slight variation per run. Let's put some thresholds
        // to account for those. See http://rembrandtjs.com for more information
        await compareImages(outputImageResult, expectedOutputImage, {
          thresholdType: Rembrandt.THRESHOLD_PERCENT,
          maxThreshold: 0.01,
          maxDelta: 20,
          maxOffset: 0,
        });
      });
    });
  });
});

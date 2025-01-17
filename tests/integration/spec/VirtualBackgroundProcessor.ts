import * as assert from 'assert';
import { ImageFit, VirtualBackgroundProcessor, VirtualBackgroundProcessorOptions } from '../../../lib';
import { compareImages, getImageFromCanvas, loadImage } from '../util';

describe('VirtualBackgroundProcessor', function() {
  this.timeout(60000);

  it('should create instance', async () => {
    const img = { complete: true, naturalHeight: 720 } as HTMLImageElement;
    const options: VirtualBackgroundProcessorOptions = {
      assetsPath: '',
      backgroundImage: img,
      fitType: ImageFit.Contain,
      maskBlurRadius: 3,
      useWebWorker: false
    };
    const processor = new VirtualBackgroundProcessor(options);
    assert.strictEqual(processor.maskBlurRadius, 3);
    assert.strictEqual(processor.fitType, ImageFit.Contain);
    assert.strictEqual(processor.backgroundImage, img);
  });

  describe('should render correct output', async () => {
    const runTest = async (options?: any) => {
      options = options || {};
      const inputCanvas = new OffscreenCanvas(1, 1);
      const outputCanvas = document.createElement('canvas');
      const inputImage = await loadImage('/images/input/input_person.jpg');
      const backgroundImage = await loadImage('/images/input/input_background.jpg');

      inputCanvas.height = inputImage.height;
      inputCanvas.width = inputImage.width;
      outputCanvas.height = inputImage.height;
      outputCanvas.width = inputImage.width;
      inputCanvas.getContext('2d')!.drawImage(inputImage, 0, 0);

      const processor = new VirtualBackgroundProcessor({
        ...options,
        assetsPath: '/assets',
        backgroundImage,
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
      expectedImageName: 'background_default',
    },{
      name: 'fitType is None',
      options: { fitType: ImageFit.None },
      expectedImageName: 'background_none',
    },{
      name: 'fitType is Fill',
      options: { fitType: ImageFit.Fill },
      expectedImageName: 'background_fill',
    },{
      name: 'fitType is Cover',
      options: { fitType: ImageFit.Cover },
      expectedImageName: 'background_cover',
    },{
      name: 'fitType is Contain',
      options: { fitType: ImageFit.Contain },
      expectedImageName: 'background_contain',
    },{
      name: 'maskBlurRadius is not default',
      options: { maskBlurRadius: 30 },
      expectedImageName: 'background_mask_blur_30',
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

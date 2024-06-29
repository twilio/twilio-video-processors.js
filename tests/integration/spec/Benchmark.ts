import * as assert from 'assert';
import { GaussianBlurBackgroundProcessor, Pipeline, VirtualBackgroundProcessor } from '../../../lib';
import { loadImage } from '../util';

describe('Benchmark', function() {
  this.timeout(30000);
  let processor: GaussianBlurBackgroundProcessor | VirtualBackgroundProcessor;

  [{
    name: 'GaussianBlurBackgroundProcessor',
    initProcessor: async () => new GaussianBlurBackgroundProcessor({ assetsPath: '/assets', pipeline: Pipeline.Canvas2D }),
  },{
    name: 'VirtualBackgroundProcessor',
    initProcessor: async () => {
      const backgroundImage = await loadImage('/images/input/input_background.jpg');
      return new VirtualBackgroundProcessor({ assetsPath: '/assets', backgroundImage, pipeline: Pipeline.Canvas2D });
    },
  }].forEach(({ name, initProcessor }) => {
    it(`should not exceed max delays for ${name}`, async () => {
      const inputCanvas = new OffscreenCanvas(1, 1);
      const outputCanvas = document.createElement('canvas');
      const inputImage = await loadImage('/images/input/input_person.jpg');

      inputCanvas.height = inputImage.height;
      inputCanvas.width = inputImage.width;
      outputCanvas.height = inputImage.height;
      outputCanvas.width = inputImage.width;
      inputCanvas.getContext('2d')!.drawImage(inputImage, 0, 0);

      processor = await initProcessor();
      await processor.loadModel();

      await new Promise(resolve => {
        let shouldProcess = true;
        setTimeout(() => {
          shouldProcess = false;
        }, 5000);
        const processFrame = () => {
          if (!shouldProcess) {
            return resolve(null);
          }
          processor.processFrame(inputCanvas, outputCanvas).then(() => setTimeout(processFrame, 0));
        };
        processFrame();
      });

      // NOTE(csantos): maxValues were determined base on testing on a 2019 MacBook Pro.
      // Adjusted to get a reasonable 30+ FPS
      [{
        stat: 'imageCompositionDelay',
        maxValue: 2
      },{
        stat: 'inputImageResizeDelay',
        maxValue: 5
      },{
        stat: 'processFrameDelay',
        maxValue: 20
      },{
        stat: 'segmentationDelay',
        maxValue: 10
      }].forEach(({ stat, maxValue }) => {
        const currentValue = processor['_benchmark'].getAverageDelay(stat)!;
        console.log({ stat, maxValue, currentValue });
        assert(currentValue <= maxValue);
      });
    });
  });
});

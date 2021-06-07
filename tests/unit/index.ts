import { Canvas } from './mocks/Canvas';
import { ImageData } from './mocks/ImageData';

const root = global as any;
root.ImageData = root.ImageData || ImageData;
root.OffscreenCanvas = root.OffscreenCanvas || Canvas;
root.document = root.document || {
  createElement(name: string) {
    if (name === 'canvas') {
      return new Canvas(1, 1);
    }
  }
};

import './utils/Benchmark';
import './processors/grayscale';
import './processors/background/BackgroundProcessor';
import './processors/background/GaussianBlurBackgroundProcessor';
import './processors/background/VirtualBackgroundProcessor';

import { Canvas } from './mocks/Canvas';
import { ImageData } from './mocks/ImageData';

const createImageBitmap = async () => new ImageData(1, 1);

const navigator = {
  userAgent : 'foo'
};

const root = global as any;
root.ImageData = root.ImageData || ImageData;
root.OffscreenCanvas = root.OffscreenCanvas || Canvas;
root.createImageBitmap = root.createImageBitmap || createImageBitmap;
root.navigator = root.navigator || navigator;
root.window = root.window || {
  createImageBitmap,
  navigator
};
root.document = root.document || {
  createElement(name: string) {
    if (name === 'canvas') {
      return new Canvas(1, 1);
    }
  }
};

import './spec/processors/background/BackgroundProcessor';
import './spec/processors/background/GaussianBlurBackgroundProcessor';
import './spec/processors/background/VirtualBackgroundProcessor';
import './spec/utils/Benchmark';
import './spec/utils/support';

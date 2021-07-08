import { Canvas } from './mocks/Canvas';
import { ImageData } from './mocks/ImageData';

const root = global as any;
root.ImageData = root.ImageData || ImageData;
root.OffscreenCanvas = root.OffscreenCanvas || Canvas;
root.window = root.window || {
  navigator : {
    userAgent : 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.77 Safari/537.36'
  }
}
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
import './spec/processors/grayscale';
import './spec/utils/Benchmark';
import './spec/utils/support';

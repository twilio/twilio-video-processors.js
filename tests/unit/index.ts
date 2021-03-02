import { OffscreenCanvas } from './mocks/OffscreenCanvas';

const root = global as any;
root.OffscreenCanvas = root.OffscreenCanvas || OffscreenCanvas;

import './utils/Benchmark';
import './processors/grayscale';
import './processors/background/BackgroundProcessor';
import './processors/background/GaussianBlurBackgroundProcessor';
import './processors/background/VirtualBackgroundProcessor';

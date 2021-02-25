import { OffscreenCanvas } from './mocks/OffscreenCanvas';

const root = global as any;
root.OffscreenCanvas = root.OffscreenCanvas || OffscreenCanvas;

import './videoprocessors/grayscale';

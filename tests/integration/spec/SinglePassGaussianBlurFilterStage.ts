import * as assert from 'assert';
import { WebGL2Pipeline } from '../../../lib/processors/pipelines';
import { SinglePassGaussianBlurFilterStage } from '../../../lib/processors/background/pipelines/gaussianblurfilterpipeline/SinglePassGaussianBlurFilterStage';

// CPU reference for one horizontal pass over a white-left/black-right step.
// Sampling hits texel centers with NEAREST filtering, so this is exact up to
// 8-bit rounding.
function expectedStepEdgeValue(radius: number, distanceFromEdge: number): number {
  let totalWeight = 1;
  let whiteWeight = 0;
  for (let i = 1; i <= radius; i++) {
    const weight = Math.exp(-0.5 * i * i / radius / radius);
    totalWeight += 2 * weight;
    if (i > distanceFromEdge) {
      whiteWeight += weight;
    }
  }
  return 255 * whiteWeight / totalWeight;
}

describe('SinglePassGaussianBlurFilterStage', function() {
  this.timeout(10000);

  const width = 512;
  const height = 4;
  const edgeX = width / 2;

  let canvas: OffscreenCanvas;
  let gl: WebGL2RenderingContext;

  beforeEach(function() {
    canvas = new OffscreenCanvas(width, height);
    gl = canvas.getContext('webgl2') as WebGL2RenderingContext;
    if (!gl) {
      // ChromeNoGPU has no WebGL2. Skip, so it can't pass vacuously.
      this.skip();
    }
  });

  afterEach(() => {
    gl?.getExtension('WEBGL_lose_context')?.loseContext();
  });

  // A radius above 127 catches a fixed-size weight table: a clamped index gives
  // every far tap the same weight instead of a decaying one.
  it('should match a Gaussian step-edge response at radius 200', () => {
    const radius = 200;
    const distanceFromEdge = 130;

    const stepCanvas = new OffscreenCanvas(width, height);
    const ctx = stepCanvas.getContext('2d')!;
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, width, height);
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, edgeX, height);

    const inputStage = new WebGL2Pipeline.InputStage(gl);
    const stage = new SinglePassGaussianBlurFilterStage(gl, 'horizontal', 'canvas', 0);
    try {
      stage.updateRadius(radius);
      inputStage.render(stepCanvas);
      stage.render();

      const pixel = new Uint8Array(4);
      gl.readPixels(edgeX + distanceFromEdge, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixel);
      const expected = expectedStepEdgeValue(radius, distanceFromEdge);
      assert.ok(
        Math.abs(pixel[0] - expected) <= 1.5,
        `expected red ${expected.toFixed(2)}, got ${pixel[0]}`
      );
    } finally {
      stage.cleanUp();
      inputStage.cleanUp();
    }
  });
});

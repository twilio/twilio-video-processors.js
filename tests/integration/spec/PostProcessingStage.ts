import * as assert from 'assert';
import { PostProcessingStage } from '../../../lib/processors/background/pipelines/backgroundprocessorpipeline/PostProcessingStage';

describe('PostProcessingStage', function() {
  this.timeout(10000);

  const width = 256;
  const height = 144;

  let webgl2Canvas: OffscreenCanvas;
  let gl: WebGL2RenderingContext;

  beforeEach(function() {
    webgl2Canvas = new OffscreenCanvas(width, height);
    gl = webgl2Canvas.getContext('webgl2') as WebGL2RenderingContext;
    if (!gl) {
      // ChromeNoGPU has no WebGL2. Skip, so it can't pass vacuously.
      this.skip();
    }
  });

  // A lost context keeps getContext('webgl2') non-null while every shader
  // compile fails, the same shape as a driver rejecting the program. The
  // track must still paint rather than throw every frame.
  it('should composite the person via Canvas2D when the WebGL2 shaders fail to build', () => {
    gl.getExtension('WEBGL_lose_context')!.loseContext();

    const inputFrame = new OffscreenCanvas(width, height);
    const inputCtx = inputFrame.getContext('2d')!;
    inputCtx.fillStyle = '#f00';
    inputCtx.fillRect(0, 0, width, height);

    // Person on the left half only.
    const personMask = new ImageData(width, height);
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width / 2; x++) {
        personMask.data[(y * width + x) * 4 + 3] = 255;
      }
    }

    const outputCanvas = new OffscreenCanvas(width, height);
    const stage = new PostProcessingStage(
      { height, width },
      webgl2Canvas,
      outputCanvas,
      8,
      () => {},
      false
    );

    stage.render(inputFrame, personMask);

    const outputCtx = outputCanvas.getContext('2d')!;
    // Sample 8 sigma from the mask boundary and the canvas border, which the
    // canvas blur filter fades toward transparent.
    const y = height / 2;
    const personPixel = Array.from(outputCtx.getImageData(width / 4, y, 1, 1).data);
    assert.deepStrictEqual(personPixel, [255, 0, 0, 255], `expected the person pixel to be painted, got ${personPixel}`);
    const backgroundPixel = Array.from(outputCtx.getImageData(width * 3 / 4, y, 1, 1).data);
    assert.strictEqual(backgroundPixel[3], 0, `expected the background pixel to be masked out, got ${backgroundPixel}`);
  });
});

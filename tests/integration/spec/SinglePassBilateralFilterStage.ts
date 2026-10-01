import * as assert from 'assert';
import { WASM_INFERENCE_DIMENSIONS } from '../../../lib/constants';
import { SinglePassBilateralFilterStage } from '../../../lib/processors/background/pipelines/personmaskupscalepipeline/SinglePassBilateralFilterStage';

// The MAX_FRAGMENT_UNIFORM_VECTORS minimum WebGL2 guarantees. A shader within
// it links on every conforming device.
const WEBGL2_MIN_FRAGMENT_UNIFORM_VECTORS = 224;

// Each float array element takes its own vec4 row; samplers don't count.
function countUniformVectors(gl: WebGL2RenderingContext, program: WebGLProgram): number {
  const uniformCount = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);
  let vectors = 0;
  for (let i = 0; i < uniformCount; i++) {
    const uniform = gl.getActiveUniform(program, i)!;
    if (uniform.type === gl.SAMPLER_2D) {
      continue;
    }
    vectors += uniform.size;
  }
  return vectors;
}

describe('SinglePassBilateralFilterStage', function() {
  this.timeout(10000);

  let canvas: OffscreenCanvas;
  let gl: WebGL2RenderingContext;

  beforeEach(function() {
    canvas = new OffscreenCanvas(480, 640);
    gl = canvas.getContext('webgl2') as WebGL2RenderingContext;
    if (!gl) {
      // ChromeNoGPU has no WebGL2. Skip, so it can't pass vacuously.
      this.skip();
    }
  });

  // Constructing throws on a shader that fails to compile or link, and the
  // constructor's uniform upload leaves its program current.
  const buildStage = () => {
    const stage = new SinglePassBilateralFilterStage(
      gl,
      'horizontal',
      'texture',
      WASM_INFERENCE_DIMENSIONS,
      { height: canvas.height, width: canvas.width },
      1,
      2
    );
    const program = gl.getParameter(gl.CURRENT_PROGRAM) as WebGLProgram;
    assert.ok(program, 'expected the stage to have linked and bound a program');
    return { program, stage };
  };

  it('should fit the fragment shader within the WebGL2 minimum uniform-vector budget', () => {
    const { program, stage } = buildStage();
    try {
      const vectors = countUniformVectors(gl, program);
      assert.ok(
        vectors <= WEBGL2_MIN_FRAGMENT_UNIFORM_VECTORS,
        `fragment shader uses ${vectors} uniform vectors, exceeding the `
          + `${WEBGL2_MIN_FRAGMENT_UNIFORM_VECTORS} guaranteed by WebGL2`
      );
    } finally {
      stage.cleanUp();
    }
  });

  // The constructor seeds sigma 0. A coefficient outside the float32 range
  // arrives as -Infinity, making exp(x * x * coeff) NaN or 0 depending on driver.
  it('should upload a finite Gaussian coefficient at sigma 0', () => {
    const { program, stage } = buildStage();
    try {
      ['u_negInvTwoSigmaSqColor', 'u_negInvTwoSigmaSqTexel'].forEach((name) => {
        const location = gl.getUniformLocation(program, name);
        assert.ok(location, `${name} is not an active uniform`);
        const value = gl.getUniform(program, location);
        assert.ok(
          Number.isFinite(value),
          `${name} reached the shader as ${value}, expected a finite float32`
        );
      });
    } finally {
      stage.cleanUp();
    }
  });
});

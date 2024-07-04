import {
  inputResolutions,
  SegmentationConfig,
} from '../helpers/segmentationHelper'
import {
  compileShader,
  createPiplelineStageProgram,
  glsl,
} from '../helpers/webglHelper'

export function buildFastBilateralFilterStage(
  gl: WebGL2RenderingContext,
  vertexShader: WebGLShader,
  positionBuffer: WebGLBuffer,
  texCoordBuffer: WebGLBuffer,
  inputTexture: WebGLTexture,
  segmentationConfig: SegmentationConfig,
  outputTexture: WebGLTexture,
  canvas: HTMLCanvasElement
) {
  // NOTE(mmalavalli): This is a faster approximation of the joint bilateral filter.
  // For a given pixel, instead of calculating the space and color weights of all
  // the pixels within the filter kernel, which would have a complexity of O(r^2),
  // we calculate the space and color weights of only those pixels which form two
  // diagonal lines between the two pairs of opposite corners of the filter kernel,
  // which would have a complexity of O(r). This improves the overall complexity
  // of this stage from O(w x h x r^2) to O(w x h x r), where:
  // w => width of the output video frame
  // h => height of the output video frame
  // r => radius of the joint bilateral filter kernel
  const fragmentShaderSource = glsl`#version 300 es

    precision highp float;

    uniform sampler2D u_inputFrame;
    uniform sampler2D u_segmentationMask;
    uniform vec2 u_texelSize;
    uniform float u_step;
    uniform float u_radius;
    uniform float u_offset;
    uniform float u_sigmaTexel;
    uniform float u_sigmaColor;

    in vec2 v_texCoord;

    out vec4 outColor;

    float gaussian(float x, float sigma) {
      return exp(-0.5 * x * x / sigma / sigma);
    }

    float calculateSpaceWeight(vec2 coord) {
      float x = distance(v_texCoord, coord);
      float sigma = u_sigmaTexel;
      return gaussian(x, sigma);
    }

    float calculateColorWeight(vec2 coord) {
      vec3 centerColor = texture(u_inputFrame, v_texCoord).rgb;
      vec3 coordColor = texture(u_inputFrame, coord).rgb;
      float x = distance(centerColor, coordColor);
      float sigma = u_sigmaColor;
      return gaussian(x, sigma);
    }

    void main() {
      vec3 centerColor = texture(u_inputFrame, v_texCoord).rgb;
      float newVal = 0.0;
      float totalWeight = 0.0;

      vec2 leftTopCoord = vec2(v_texCoord + vec2(-u_radius, -u_radius) * u_texelSize);
      vec2 rightTopCoord = vec2(v_texCoord + vec2(u_radius, -u_radius) * u_texelSize);
      vec2 leftBottomCoord = vec2(v_texCoord + vec2(-u_radius, u_radius) * u_texelSize);
      vec2 rightBottomCoord = vec2(v_texCoord + vec2(u_radius, u_radius) * u_texelSize);

      float leftTopSegAlpha = texture(u_segmentationMask, leftTopCoord).a;
      float rightTopSegAlpha = texture(u_segmentationMask, rightTopCoord).a;
      float leftBottomSegAlpha = texture(u_segmentationMask, leftBottomCoord).a;
      float rightBottomSegAlpha = texture(u_segmentationMask, rightBottomCoord).a;
      float totalSegAlpha = leftTopSegAlpha + rightTopSegAlpha + leftBottomSegAlpha + rightBottomSegAlpha;

      if (totalSegAlpha <= 0.0) {
        newVal = 0.0;
      } else if (totalSegAlpha >= 4.0) {
        newVal = 1.0;
      } else {
        for (float i = 0.0; i <= u_radius - u_offset; i += u_step) {
          vec2 shift = vec2(i, i) * u_texelSize;
          vec2 coord = vec2(v_texCoord + shift);
          float spaceWeight = calculateSpaceWeight(coord);
          float colorWeight = calculateColorWeight(coord);
          float weight = spaceWeight * colorWeight;
          float alpha = texture(u_segmentationMask, coord).a;
          totalWeight += weight;
          newVal += weight * alpha;

          if (i != 0.0) {
            shift = vec2(i, -i) * u_texelSize;
            coord = vec2(v_texCoord + shift);
            colorWeight = calculateColorWeight(coord);
            weight = spaceWeight * colorWeight;
            alpha = texture(u_segmentationMask, coord).a;
            totalWeight += weight;
            newVal += weight * texture(u_segmentationMask, coord).a;
            
            shift = vec2(-i, i) * u_texelSize;
            coord = vec2(v_texCoord + shift);
            colorWeight = calculateColorWeight(coord);
            weight = spaceWeight * colorWeight;
            alpha = texture(u_segmentationMask, coord).a;
            totalWeight += weight;
            newVal += weight * texture(u_segmentationMask, coord).a;
            
            shift = vec2(-i, -i) * u_texelSize;
            coord = vec2(v_texCoord + shift);
            colorWeight = calculateColorWeight(coord);
            weight = spaceWeight * colorWeight;
            alpha = texture(u_segmentationMask, coord).a;
            totalWeight += weight;
            newVal += weight * texture(u_segmentationMask, coord).a;          
          }
        }
        newVal /= totalWeight;
      }

      outColor = vec4(vec3(0.0), newVal);
    }
  `

  const [segmentationWidth, segmentationHeight] = inputResolutions[
    segmentationConfig.inputResolution
  ]
  const { width: outputWidth, height: outputHeight } = canvas
  const texelWidth = 1 / outputWidth
  const texelHeight = 1 / outputHeight

  const fragmentShader = compileShader(
    gl,
    gl.FRAGMENT_SHADER,
    fragmentShaderSource
  )
  const program = createPiplelineStageProgram(
    gl,
    vertexShader,
    fragmentShader,
    positionBuffer,
    texCoordBuffer
  )
  const inputFrameLocation = gl.getUniformLocation(program, 'u_inputFrame')
  const segmentationMaskLocation = gl.getUniformLocation(
    program,
    'u_segmentationMask'
  )
  const texelSizeLocation = gl.getUniformLocation(program, 'u_texelSize')
  const stepLocation = gl.getUniformLocation(program, 'u_step')
  const radiusLocation = gl.getUniformLocation(program, 'u_radius')
  const offsetLocation = gl.getUniformLocation(program, 'u_offset')
  const sigmaTexelLocation = gl.getUniformLocation(program, 'u_sigmaTexel')
  const sigmaColorLocation = gl.getUniformLocation(program, 'u_sigmaColor')

  const frameBuffer = gl.createFramebuffer()
  gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuffer)
  gl.framebufferTexture2D(
    gl.FRAMEBUFFER,
    gl.COLOR_ATTACHMENT0,
    gl.TEXTURE_2D,
    outputTexture,
    0
  )

  gl.useProgram(program)
  gl.uniform1i(inputFrameLocation, 0)
  gl.uniform1i(segmentationMaskLocation, 1)
  gl.uniform2f(texelSizeLocation, texelWidth, texelHeight)

  // Ensures default values are configured to prevent infinite
  // loop in fragment shader
  updateSigmaSpace(0)
  updateSigmaColor(0)

  function render() {
    gl.viewport(0, 0, outputWidth, outputHeight)
    gl.useProgram(program)
    gl.activeTexture(gl.TEXTURE1)
    gl.bindTexture(gl.TEXTURE_2D, inputTexture)
    gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuffer)
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
  }

  function updateSigmaSpace(sigmaSpace: number) {
    sigmaSpace *= Math.max(
      outputWidth / segmentationWidth,
      outputHeight / segmentationHeight
    )

    const kSparsityFactor = 0.66 // Higher is more sparse.
    const sparsity = Math.max(1, Math.sqrt(sigmaSpace) * kSparsityFactor)
    const step = sparsity
    const radius = sigmaSpace
    const offset = step > 1 ? step * 0.5 : 0
    const sigmaTexel = Math.max(texelWidth, texelHeight) * sigmaSpace

    gl.useProgram(program)
    gl.uniform1f(stepLocation, step)
    gl.uniform1f(radiusLocation, radius)
    gl.uniform1f(offsetLocation, offset)
    gl.uniform1f(sigmaTexelLocation, sigmaTexel)
  }

  function updateSigmaColor(sigmaColor: number) {
    gl.useProgram(program)
    gl.uniform1f(sigmaColorLocation, sigmaColor)
  }

  function cleanUp() {
    gl.deleteFramebuffer(frameBuffer)
    gl.deleteProgram(program)
    gl.deleteShader(fragmentShader)
  }

  return { render, updateSigmaSpace, updateSigmaColor, cleanUp }
}

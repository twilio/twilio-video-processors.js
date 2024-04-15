import {
  inputResolutions,
  SegmentationConfig,
} from '../helpers/segmentationHelper'
import {
  compileShader,
  createPiplelineStageProgram,
  createTexture,
  glsl,
} from '../helpers/webglHelper'

export function buildLoadSegmentationStage(
  gl: WebGL2RenderingContext,
  vertexShader: WebGLShader,
  positionBuffer: WebGLBuffer,
  texCoordBuffer: WebGLBuffer,
  segmentationConfig: SegmentationConfig,
  maskContext: CanvasRenderingContext2D,
  tflite: any,
  outputTexture: WebGLTexture
) {
  const fragmentShaderSource = glsl`#version 300 es

    precision highp float;

    uniform sampler2D u_inputSegmentation;

    in vec2 v_texCoord;

    out vec4 outColor;

    void main() {
      float segmentation = texture(u_inputSegmentation, v_texCoord).a;
      outColor = vec4(vec3(0.0), segmentation);
    }
  `

  // TFLite memory will be accessed as float32
  const tfliteOutputMemoryOffset = tflite._getOutputMemoryOffset() / 4

  const [segmentationWidth, segmentationHeight] = inputResolutions[
    segmentationConfig.inputResolution
  ]

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
  const inputLocation = gl.getUniformLocation(program, 'u_inputSegmentation')
  const inputTexture = createTexture(
    gl,
    gl.RGBA8,
    segmentationWidth,
    segmentationHeight
  )

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
  gl.uniform1i(inputLocation, 1)

  const segmentationMaskPixels = segmentationWidth * segmentationHeight
  const segmentationMaskData = new ImageData(
    new Uint8ClampedArray(segmentationMaskPixels * 4),
    segmentationWidth,
    segmentationHeight
  )

  function loadSegmentationMask() {
    for (let i = 0; i < segmentationMaskPixels; i++) {
      const p = tflite.HEAPF32[tfliteOutputMemoryOffset + i]
      segmentationMaskData.data[i * 4 + 3] = Math.round(p * 255)
    }
    maskContext.putImageData(segmentationMaskData, 0, 0)
  }

  function render() {
    loadSegmentationMask()
    gl.viewport(0, 0, segmentationWidth, segmentationHeight)
    gl.useProgram(program)
    gl.activeTexture(gl.TEXTURE1)
    gl.bindTexture(gl.TEXTURE_2D, inputTexture)
    gl.texSubImage2D(
      gl.TEXTURE_2D,
      0,
      0,
      0,
      segmentationWidth,
      segmentationHeight,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      maskContext.canvas
    )
    gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuffer)
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
  }

  function cleanUp() {
    gl.deleteFramebuffer(frameBuffer)
    gl.deleteTexture(inputTexture)
    gl.deleteProgram(program)
    gl.deleteShader(fragmentShader)
  }

  return { render, cleanUp }
}

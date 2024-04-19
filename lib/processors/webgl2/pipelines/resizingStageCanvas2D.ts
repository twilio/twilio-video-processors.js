import { Dimensions } from '../../../types'

import {
  createPiplelineStageProgram,
  readPixelsAsync,
} from '../helpers/webglHelper'

export function buildResizingStageCanvas2D(
  gl: WebGL2RenderingContext,
  vertexShader: WebGLShader,
  fragmentShader: WebGLShader,
  positionBuffer: WebGLBuffer,
  texCoordBuffer: WebGLBuffer,
  outputDimensions: Dimensions,
  outputTexture: WebGLTexture | null
) {
  const { height: outputHeight, width: outputWidth } = outputDimensions
  const outputPixelCount = outputWidth * outputHeight

  const program = createPiplelineStageProgram(
    gl,
    vertexShader,
    fragmentShader,
    positionBuffer,
    texCoordBuffer
  )

  const inputFrameLocation = gl.getUniformLocation(
    program,
    'u_inputFrame'
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

  const outputPixels = new Uint8ClampedArray(outputPixelCount * 4)

  gl.useProgram(program)
  gl.uniform1i(inputFrameLocation, 0)

  function render(): Uint8ClampedArray {
    gl.viewport(0, 0, outputWidth, outputHeight)
    gl.useProgram(program)
    gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuffer)
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)

    readPixelsAsync(
      gl,
      0,
      0,
      outputWidth,
      outputHeight,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      outputPixels
    )

    return outputPixels
  }

  function cleanUp() {
    gl.deleteFramebuffer(frameBuffer)
    gl.deleteTexture(outputTexture)
    gl.deleteProgram(program)
  }

  return { render, cleanUp }
}

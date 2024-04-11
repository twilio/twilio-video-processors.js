import { Dimensions } from '../../../types'

import {
  compileShader,
  createPiplelineStageProgram,
  glsl,
  readPixelsAsync,
} from '../helpers/webglHelper'

export function buildResizingStageCanvas2D(
  gl: WebGL2RenderingContext,
  vertexShader: WebGLShader,
  positionBuffer: WebGLBuffer,
  texCoordBuffer: WebGLBuffer,
  outputDimensions: Dimensions,
  outputTexture: WebGLTexture | null,
  shouldDraw: boolean = false
) {
  const fragmentShaderSource = glsl`#version 300 es

    precision highp float;

    uniform sampler2D u_inputFrame;

    in vec2 v_texCoord;

    out vec4 outColor;

    void main() {
      outColor = texture(u_inputFrame, v_texCoord);
    }
  `

  const { height: outputHeight, width: outputWidth } = outputDimensions
  const outputPixelCount = outputWidth * outputHeight

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

    // Downloads pixels asynchronously from GPU while rendering the current frame
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

    if (shouldDraw) {
      gl.bindFramebuffer(gl.FRAMEBUFFER, null)
      gl.clearColor(0, 0, 0, 0)
      gl.clear(gl.COLOR_BUFFER_BIT)
      gl.useProgram(program)
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
    }

    return outputPixels
  }

  function cleanUp() {
    gl.deleteFramebuffer(frameBuffer)
    gl.deleteTexture(outputTexture)
    gl.deleteProgram(program)
    gl.deleteShader(fragmentShader)
  }

  return { render, cleanUp }
}

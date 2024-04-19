import {
  inputResolutions,
  SegmentationConfig,
} from '../helpers/segmentationHelper'
import { createPiplelineStageProgram } from '../helpers/webglHelper'

export function buildJointBilateralFilterStageCanvas2D(
  gl: WebGL2RenderingContext,
  vertexShader: WebGLShader,
  fragmentShader: WebGLShader,
  positionBuffer: WebGLBuffer,
  texCoordBuffer: WebGLBuffer,
  inputTexture: WebGLTexture,
  segmentationConfig: SegmentationConfig,
  canvas: HTMLCanvasElement
) {
  const [segmentationWidth, segmentationHeight] = inputResolutions[
    segmentationConfig.inputResolution
  ]
  const { width: outputWidth, height: outputHeight } = canvas
  const texelWidth = 1 / outputWidth
  const texelHeight = 1 / outputHeight

  const program = createPiplelineStageProgram(
    gl,
    vertexShader,
    fragmentShader,
    positionBuffer,
    texCoordBuffer
  )
  const inputFrameLocation = gl.getUniformLocation(program, 'u_inputFrame')
  const segmentationMaskLocation = gl.getUniformLocation(program, 'u_segmentationMask')
  const texelSizeLocation = gl.getUniformLocation(program, 'u_texelSize')
  const stepLocation = gl.getUniformLocation(program, 'u_step')
  const radiusLocation = gl.getUniformLocation(program, 'u_radius')
  const offsetLocation = gl.getUniformLocation(program, 'u_offset')
  const sigmaTexelLocation = gl.getUniformLocation(program, 'u_sigmaTexel')
  const sigmaColorLocation = gl.getUniformLocation(program, 'u_sigmaColor')

  gl.useProgram(program)
  gl.uniform1i(inputFrameLocation, 0)
  gl.uniform1i(segmentationMaskLocation, 1)
  gl.uniform2f(texelSizeLocation, texelWidth, texelHeight)

  updateSigmaSpace(0)
  updateSigmaColor(0)

  function render() {
    gl.bindFramebuffer(gl.FRAMEBUFFER, null)
    gl.viewport(0, 0, outputWidth, outputHeight)
    gl.useProgram(program)
    gl.activeTexture(gl.TEXTURE1)
    gl.bindTexture(gl.TEXTURE_2D, inputTexture)
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
  }

  function updateBlurRadius(radius: number) {
    gl.useProgram(program)
    gl.uniform1f(radiusLocation, radius)
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
    gl.deleteProgram(program)
  }

  return { render, updateBlurRadius, updateSigmaSpace, updateSigmaColor, cleanUp }
}

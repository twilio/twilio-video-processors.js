import { Dimensions } from '../../../types'
import { SourcePlayback } from '../helpers/sourceHelper'

import {
  compileShader,
  createTexture,
  glsl,
} from '../helpers/webglHelper'

import { buildResizingStageCanvas2D } from './resizingStageCanvas2D'

export function buildWebGL2PipelineCanvas2D (
  sourcePlayback: SourcePlayback,
  outputDimensions: Dimensions,
  canvas: HTMLCanvasElement,
  shouldUpscale: boolean
) {
  const vertexShaderSource = shouldUpscale ? glsl`#version 300 es

    in vec2 a_position;
    in vec2 a_texCoord;

    out vec2 v_texCoord;

    void main() {
      gl_Position = vec4(a_position, 0.0, 1.0);
      v_texCoord = vec2(a_texCoord.s, 1.0 - a_texCoord.t);
    }
  ` : glsl`#version 300 es

    in vec2 a_position;
    in vec2 a_texCoord;

    out vec2 v_texCoord;

    void main() {
      gl_Position = vec4(a_position, 0.0, 1.0);
      v_texCoord = a_texCoord;
    }
  `
  const gl = canvas.getContext('webgl2')!
  const vertexShader = compileShader(gl, gl.VERTEX_SHADER, vertexShaderSource)
  const vertexArray = gl.createVertexArray()
  gl.bindVertexArray(vertexArray)

  const positionBuffer = gl.createBuffer()!
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([-1.0, -1.0, 1.0, -1.0, -1.0, 1.0, 1.0, 1.0]),
    gl.STATIC_DRAW
  )

  const texCoordBuffer = gl.createBuffer()!
  gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer)
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 1.0, 1.0]),
    gl.STATIC_DRAW
  )

  // We don't use texStorage2D here because texImage2D seems faster
  // to upload video texture than texSubImage2D even though the latter
  // is supposed to be the recommended way:
  // https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/WebGL_best_practices#use_texstorage_to_create_textures
  const inputFrameTexture = gl.createTexture()
  gl.bindTexture(gl.TEXTURE_2D, inputFrameTexture)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST)

  const { height, width } = outputDimensions
  const resizedImageTexture = createTexture(
    gl,
    gl.RGBA8,
    width,
    height
  )
  const resizingStage = buildResizingStageCanvas2D(
    gl,
    vertexShader,
    positionBuffer,
    texCoordBuffer,
    outputDimensions,
    resizedImageTexture,
    shouldUpscale
  )

  function render(): Uint8ClampedArray {
    gl.clearColor(0, 0, 0, 0)
    gl.clear(gl.COLOR_BUFFER_BIT)

    gl.activeTexture(gl.TEXTURE0)
    gl.bindTexture(gl.TEXTURE_2D, inputFrameTexture)

    // texImage2D seems faster than texSubImage2D to upload
    // video texture
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      sourcePlayback.htmlElement
    )

    gl.bindVertexArray(vertexArray)
    return resizingStage.render()
  }

  function cleanUp() {
    resizingStage.cleanUp()
    gl.deleteTexture(inputFrameTexture)
    gl.deleteBuffer(texCoordBuffer)
    gl.deleteBuffer(positionBuffer)
    gl.deleteVertexArray(vertexArray)
    gl.deleteShader(vertexShader)
  }

  return { render, cleanUp }
}

import { Dimensions } from '../../../types'
import { PostProcessingConfig } from '../helpers/postProcessingHelper'
import { SourcePlayback } from '../helpers/sourceHelper'

import {
  compileShader,
  createTexture,
  glsl,
} from '../helpers/webglHelper'

import { buildJointBilateralFilterStageCanvas2D } from './jointBilateralFilterStageCanvas2D'
import { buildResizingStageCanvas2D } from './resizingStageCanvas2D'

export function buildWebGL2PipelineCanvas2D(
  sourcePlayback: SourcePlayback,
  downscaleDimensions: Dimensions,
  upscaleCanvas: HTMLCanvasElement,
  downscaleCanvas?: HTMLCanvasElement,
) {
  const vertexShaderSources = {
    downscale: glsl`#version 300 es
      in vec2 a_position;
      in vec2 a_texCoord;

      out vec2 v_texCoord;

      void main() {
        gl_Position = vec4(a_position, 0.0, 1.0);
        v_texCoord = a_texCoord;
      }
    `,
    upscale: glsl`#version 300 es
      in vec2 a_position;
      in vec2 a_texCoord;

      out vec2 v_texCoord;

      void main() {
        gl_Position = vec4(a_position * vec2(1.0, -1.0), 0.0, 1.0);
        v_texCoord = a_texCoord;
      }
    `
  }

  const fragmentShaderSources = {
    downscale: glsl`#version 300 es
      precision highp float;

      uniform sampler2D u_inputFrame;

      in vec2 v_texCoord;

      out vec4 outColor;

      void main() {
        outColor = texture(u_inputFrame, v_texCoord);
      }
    `,
    upscale: glsl`#version 300 es
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
        float coeff = -0.5 / (sigma * sigma * 4.0 + 1.0e-6);
        return exp((x * x) * coeff);
      }

      void main() {
        vec2 centerCoord = v_texCoord;
        vec3 centerColor = texture(u_inputFrame, centerCoord).rgb;
        float newVal = 0.0;

        float spaceWeight = 0.0;
        float colorWeight = 0.0;
        float totalWeight = 0.0;

        vec2 leftTopCoord = vec2(centerCoord + vec2(-u_radius, -u_radius) * u_texelSize);
        vec2 rightTopCoord = vec2(centerCoord + vec2(u_radius, -u_radius) * u_texelSize);
        vec2 leftBottomCoord = vec2(centerCoord + vec2(-u_radius, u_radius) * u_texelSize);
        vec2 rightBottomCoord = vec2(centerCoord + vec2(u_radius, u_radius) * u_texelSize);

        float leftTopSegAlpha = texture(u_segmentationMask, leftTopCoord).a;
        float rightTopSegAlpha = texture(u_segmentationMask, rightTopCoord).a;
        float leftBottomSegAlpha = texture(u_segmentationMask, leftBottomCoord).a;
        float rightBottomSegAlpha = texture(u_segmentationMask, rightBottomCoord).a;
        float totalSegAlpha = leftTopSegAlpha + rightTopSegAlpha + leftBottomSegAlpha + rightBottomSegAlpha;

        if (totalSegAlpha <= 0.0) {
          outColor = vec4(vec3(0.0), 0.0);
        } else if (totalSegAlpha >= 4.0) {
          outColor = vec4(vec3(0.0), 1.0);
        } else {
          for (float i = -u_radius + u_offset; i <= u_radius; i += u_step) {
            for (float j = -u_radius + u_offset; j <= u_radius; j += u_step) {
              vec2 shift = vec2(j, i) * u_texelSize;
              vec2 coord = vec2(centerCoord + shift);
              vec3 frameColor = texture(u_inputFrame, coord).rgb;
              float outVal = texture(u_segmentationMask, coord).a;

              spaceWeight = gaussian(distance(centerCoord, coord), u_sigmaTexel);
              colorWeight = gaussian(distance(centerColor, frameColor), u_sigmaColor);
              totalWeight += spaceWeight * colorWeight;

              newVal += spaceWeight * colorWeight * outVal;
            }
          }
          newVal /= totalWeight;

          outColor = vec4(vec3(0.0), newVal);
        }
      }
    `
  }

  const gl = upscaleCanvas.getContext('webgl2')!
 
  const fragmentShaders = {
    downscale: compileShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSources.downscale),
    upscale: compileShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSources.upscale)
  }

  const vertexShaders = {
    downscale: compileShader(gl, gl.VERTEX_SHADER, vertexShaderSources.downscale),
    upscale: compileShader(gl, gl.VERTEX_SHADER, vertexShaderSources.upscale)
  }

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

  const downscaledImageTexture = createTexture(
    gl,
    gl.RGBA8,
    downscaleDimensions.width,
    downscaleDimensions.height
  )

  const downscaledMaskImageTexture = createTexture(
    gl,
    gl.RGBA8,
    downscaleDimensions.width,
    downscaleDimensions.height
  )

  const downscaledResizingStage = buildResizingStageCanvas2D(
    gl,
    vertexShaders.downscale,
    fragmentShaders.downscale,
    positionBuffer,
    texCoordBuffer,
    downscaleDimensions,
    downscaledImageTexture
  )

  const upscaledResizingStage = downscaleCanvas && buildJointBilateralFilterStageCanvas2D(
    gl,
    vertexShaders.upscale,
    fragmentShaders.upscale,
    positionBuffer,
    texCoordBuffer,
    downscaledMaskImageTexture as WebGLTexture,
    { inputResolution: `${downscaleDimensions.width}x${downscaleDimensions.height}` },
    upscaleCanvas
  )

  function renderDownscale(): Uint8ClampedArray {
    gl.clearColor(0, 0, 0, 0)
    gl.clear(gl.COLOR_BUFFER_BIT)
    gl.activeTexture(gl.TEXTURE0)
    gl.bindTexture(gl.TEXTURE_2D, inputFrameTexture)

    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      sourcePlayback.htmlElement
    )

    gl.bindVertexArray(vertexArray)
    return downscaledResizingStage.render()
  }

  function renderUpscale(): void {
    gl.clearColor(0, 0, 0, 0)
    gl.clear(gl.COLOR_BUFFER_BIT)
    gl.activeTexture(gl.TEXTURE1)
    gl.bindTexture(gl.TEXTURE_2D, downscaledMaskImageTexture)

    gl.texSubImage2D(
      gl.TEXTURE_2D,
      0,
      0,
      0,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      downscaleCanvas!
    )

    gl.bindVertexArray(vertexArray)
    upscaledResizingStage!.render()
  }

  function cleanUp() {
    downscaledResizingStage.cleanUp()
    upscaledResizingStage?.cleanUp()
    gl.deleteTexture(inputFrameTexture)
    gl.deleteTexture(downscaledImageTexture)
    gl.deleteTexture(downscaledMaskImageTexture)
    gl.deleteBuffer(texCoordBuffer)
    gl.deleteBuffer(positionBuffer)
    gl.deleteVertexArray(vertexArray)
    gl.deleteShader(vertexShaders.downscale)
    gl.deleteShader(fragmentShaders.downscale)
    gl.deleteShader(vertexShaders.upscale)
    gl.deleteShader(fragmentShaders.upscale)
  }

  function updatePostProcessingConfig(
    postProcessingConfig: PostProcessingConfig
  ) {
    const { jointBilateralFilter = {} } = postProcessingConfig
    const { sigmaColor, sigmaSpace } = jointBilateralFilter
    if (typeof sigmaColor === 'number') {
      upscaledResizingStage!.updateSigmaColor(sigmaColor)
    }
    if (typeof sigmaSpace === 'number') {
      upscaledResizingStage!.updateSigmaSpace(sigmaSpace)
    }
  }

  return {
    renderDownscale,
    cleanUp,
    ...(downscaleCanvas && {
      renderUpscale,
      updatePostProcessingConfig,
    })
  }
}

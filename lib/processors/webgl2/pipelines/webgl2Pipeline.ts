import { BackgroundConfig } from '../helpers/backgroundHelper'
import { PostProcessingConfig } from '../helpers/postProcessingHelper'
import {
  inputResolutions,
  SegmentationConfig,
} from '../helpers/segmentationHelper'
import { SourcePlayback } from '../helpers/sourceHelper'
import { compileShader, createTexture, glsl } from '../helpers/webglHelper'
import {
  buildBackgroundBlurStage,
} from './backgroundBlurStage'
import {
  BackgroundImageStage,
  buildBackgroundImageStage,
} from './backgroundImageStage'
import { buildFastBilateralFilterStage } from './fastBilateralFilterStage'
import { buildLoadSegmentationStage } from './loadSegmentationStage'

export function buildWebGL2Pipeline(
  sourcePlayback: SourcePlayback,
  backgroundImage: HTMLImageElement | null,
  backgroundConfig: BackgroundConfig,
  segmentationConfig: SegmentationConfig,
  canvas: HTMLCanvasElement,
  benchmark: any,
  debounce: boolean
) {
  let shouldUpscaleCurrentMask = true

  const vertexShaderSource = glsl`#version 300 es

    in vec2 a_position;
    in vec2 a_texCoord;

    out vec2 v_texCoord;

    void main() {
      gl_Position = vec4(a_position, 0.0, 1.0);
      v_texCoord = a_texCoord;
    }
  `

  const { width: outputWidth, height: outputHeight } = canvas;
  const [segmentationWidth, segmentationHeight] = inputResolutions[
    segmentationConfig.inputResolution
  ]

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

  // TODO Rename segmentation and person mask to be more specific
  const segmentationTexture = createTexture(
    gl,
    gl.RGBA8,
    segmentationWidth,
    segmentationHeight
  )!
  const personMaskTexture = createTexture(
    gl,
    gl.RGBA8,
    outputWidth,
    outputHeight
  )!
  const loadSegmentationStage = buildLoadSegmentationStage(
    gl,
    vertexShader,
    positionBuffer,
    texCoordBuffer,
    segmentationConfig,
    segmentationTexture
  )
  const fastBilateralFilterStage = buildFastBilateralFilterStage(
    gl,
    vertexShader,
    positionBuffer,
    texCoordBuffer,
    segmentationTexture,
    segmentationConfig,
    personMaskTexture,
    canvas
  )
  const backgroundStage =
    backgroundConfig.type === 'blur'
      ? buildBackgroundBlurStage(
          gl,
          vertexShader,
          positionBuffer,
          texCoordBuffer,
          personMaskTexture,
          canvas
        )
      : buildBackgroundImageStage(
          gl,
          positionBuffer,
          texCoordBuffer,
          personMaskTexture,
          backgroundImage,
          canvas
        )

  async function sampleInputFrame() {
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
  }

  async function render(segmentationData: Uint8ClampedArray) {
    benchmark.start('imageCompositionDelay')
    if (shouldUpscaleCurrentMask) {
      loadSegmentationStage.render(segmentationData)
    }
    fastBilateralFilterStage.render()
    backgroundStage.render()
    if (debounce) {
      shouldUpscaleCurrentMask = !shouldUpscaleCurrentMask
    }
    benchmark.end('imageCompositionDelay')
  }

  function updatePostProcessingConfig(
    postProcessingConfig: PostProcessingConfig
  ) {
    const {
      blendMode,
      coverage,
      lightWrapping,
      jointBilateralFilter = {}
    } = postProcessingConfig

    const {
      sigmaColor,
      sigmaSpace
    } = jointBilateralFilter

    if (typeof sigmaColor === 'number') {
      fastBilateralFilterStage.updateSigmaColor(sigmaColor)
    }
    if (typeof sigmaSpace === 'number') {
      fastBilateralFilterStage.updateSigmaSpace(sigmaSpace)
    }
    if (Array.isArray(coverage)) {
      if (backgroundConfig.type === 'blur' || backgroundConfig.type === 'image') {
        backgroundStage.updateCoverage(coverage)
      }
    }
    if (backgroundConfig.type === 'image') {
      const backgroundImageStage = backgroundStage as BackgroundImageStage
      if (typeof lightWrapping === 'number') {
        backgroundImageStage.updateLightWrapping(lightWrapping)
      }
      if (typeof blendMode === 'string') {
        backgroundImageStage.updateBlendMode(blendMode)
      }
    } else if (backgroundConfig.type !== 'blur') {
      // TODO Handle no background in a separate pipeline path
      const backgroundImageStage = backgroundStage as BackgroundImageStage
      backgroundImageStage.updateCoverage([0, 0.9999])
      backgroundImageStage.updateLightWrapping(0)
    }
  }

  function cleanUp() {
    backgroundStage.cleanUp()
    fastBilateralFilterStage.cleanUp()
    loadSegmentationStage.cleanUp()

    gl.deleteTexture(personMaskTexture)
    gl.deleteTexture(segmentationTexture)
    gl.deleteTexture(inputFrameTexture)
    gl.deleteBuffer(texCoordBuffer)
    gl.deleteBuffer(positionBuffer)
    gl.deleteVertexArray(vertexArray)
    gl.deleteShader(vertexShader)
  }

  return { render, sampleInputFrame, updatePostProcessingConfig, cleanUp }
}

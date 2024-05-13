import { BLUR_FILTER_RADIUS } from '../../../constants'
import { BlendMode } from '../helpers/postProcessingHelper'
import { createTexture } from '../helpers/webglHelper'
import { WebGL2Pipeline } from './webgl2pipeline'

export class BackgroundBlurStage extends WebGL2Pipeline.ProcessingStage {
  private _backgroundTexture: WebGLTexture
  private _benchmark: any
  private _cleanupBackgroundTexture: () => void
  private _updateBackgroundTexture: () => void

  constructor(
    glOut: WebGL2RenderingContext,
    videoIn: HTMLVideoElement,
    benchmark: any,
    blurRadius: number = BLUR_FILTER_RADIUS
  ) {
    super(
      {
        textureName: 'u_personMask',
        textureUnit: 2
      },
      {
        fragmentShaderSource: `#version 300 es
          precision highp float;

          uniform sampler2D u_inputFrame;
          uniform sampler2D u_personMask;
          uniform sampler2D u_background;
          uniform vec2 u_coverage;
          uniform float u_lightWrapping;
          uniform float u_blendMode;

          in vec2 v_texCoord;

          out vec4 outColor;

          vec3 screen(vec3 a, vec3 b) {
            return 1.0 - (1.0 - a) * (1.0 - b);
          }

          vec3 linearDodge(vec3 a, vec3 b) {
            return a + b;
          }

          void main() {
            vec3 frameColor = texture(u_inputFrame, v_texCoord).rgb;
            vec3 backgroundColor = texture(u_background, v_texCoord).rgb;
            float personMask = texture(u_personMask, v_texCoord).a;
            float lightWrapMask = 1.0 - max(0.0, personMask - u_coverage.y) / (1.0 - u_coverage.y);
            vec3 lightWrap = u_lightWrapping * lightWrapMask * backgroundColor;
            frameColor = u_blendMode * linearDodge(frameColor, lightWrap) +
              (1.0 - u_blendMode) * screen(frameColor, lightWrap);
            personMask = smoothstep(u_coverage.x, u_coverage.y, personMask);
            outColor = vec4(frameColor * personMask + backgroundColor * (1.0 - personMask), 1.0);
          }
        `,
        glOut,
        type: 'canvas'
      }
    )

    this._benchmark = benchmark

    const {
      height,
      width
    } = this._outputDimensions

    const blurVideoIn = typeof OffscreenCanvas !== 'undefined'
      ? new OffscreenCanvas(0, 0)
      : document.createElement('canvas')

    blurVideoIn.width = width
    blurVideoIn.height = height

    const blurVideoInCtx2d = blurVideoIn.getContext('2d')!
    blurVideoInCtx2d.filter = `blur(${blurRadius}px)`

    this._backgroundTexture = createTexture(
      glOut,
      glOut.RGBA8,
      width,
      height
    )!

    this._cleanupBackgroundTexture = () =>
      glOut.deleteTexture(this._backgroundTexture)

    this._updateBackgroundTexture = () => {
      blurVideoInCtx2d.drawImage(
        videoIn,
        0,
        0
      )
      const { _backgroundTexture } = this
      glOut.activeTexture(
        glOut.TEXTURE0 + 4
      )
      glOut.bindTexture(
        glOut.TEXTURE_2D,
        _backgroundTexture
      )
      glOut.texSubImage2D(
        glOut.TEXTURE_2D,
        0,
        0,
        0,
        width,
        height,
        glOut.RGBA,
        glOut.UNSIGNED_BYTE,
        blurVideoIn
      )
    }

    this._setUniformVars([
      {
        name: 'u_inputFrame',
        type: 'int',
        values: [0]
      },
      {
        name: 'u_background',
        type: 'int',
        values: [4]
      },
      {
        name: 'u_coverage',
        type: 'float',
        values: [0, 1]
      },
      {
        name: 'u_lightWrapping',
        type: 'float',
        values: [0]
      },
      {
        name: 'u_blendMode',
        type: 'float',
        values: [0]
      }
    ])
  }

  cleanUp(): void {
    super.cleanUp()
    this._cleanupBackgroundTexture()
  }

  render(): void {
    const { _benchmark } = this
    this._updateBackgroundTexture()
    super.render()
    _benchmark.end('imageCompositionDelay')
  }

  updateCoverage(coverage: [number, number]): void {
    this._setUniformVars([
      {
        name: 'u_coverage',
        type: 'float',
        values: coverage
      }
    ])
  }

  updateLightWrapping(lightWrapping: number): void {
    this._setUniformVars([
      {
        name: 'u_lightWrapping',
        type: 'float',
        values: [lightWrapping]
      }
    ])
  }

  updateBlendMode(blendMode: BlendMode): void {
    this._setUniformVars([
      {
        name: 'u_blendMode',
        type: 'float',
        values: [
          blendMode === 'screen'
            ? 0
            : 1
        ]
      }
    ])
  }
}

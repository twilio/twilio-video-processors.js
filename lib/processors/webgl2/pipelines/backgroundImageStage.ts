import { BlendMode } from '../helpers/postProcessingHelper'
import { createTexture } from '../helpers/webglHelper'
import { WebGL2Pipeline } from './webgl2pipeline'

export class BackgroundImageStage extends WebGL2Pipeline.ProcessingStage {
  private _backgroundTexture: WebGLTexture
  private _benchmark: any
  private _cleanupBackgroundTexture: () => void

  constructor(
    glOut: WebGL2RenderingContext,
    backgroundImage: HTMLImageElement,
    benchmark: any
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
          in vec2 v_backgroundCoord;

          out vec4 outColor;

          vec3 screen(vec3 a, vec3 b) {
            return 1.0 - (1.0 - a) * (1.0 - b);
          }

          vec3 linearDodge(vec3 a, vec3 b) {
            return a + b;
          }

          void main() {
            vec3 frameColor = texture(u_inputFrame, v_texCoord).rgb;
            vec3 backgroundColor = texture(u_background, v_backgroundCoord).rgb;
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
        type: 'canvas',
        vertexShaderSource: `#version 300 es
          uniform vec2 u_backgroundScale;
          uniform vec2 u_backgroundOffset;

          in vec2 a_position;
          in vec2 a_texCoord;

          out vec2 v_texCoord;
          out vec2 v_backgroundCoord;

          void main() {
            // Flipping Y is required when rendering to canvas
            gl_Position = vec4(a_position * vec2(1.0, -1.0), 0.0, 1.0);
            v_texCoord = a_texCoord;
            v_backgroundCoord = a_texCoord * u_backgroundScale + u_backgroundOffset;
          }
        `
      }
    )

    this._benchmark = benchmark

    const {
      naturalHeight,
      naturalWidth
    } = backgroundImage

    this._backgroundTexture = createTexture(
      glOut,
      glOut.RGBA8,
      naturalWidth,
      naturalHeight,
      glOut.LINEAR,
      glOut.LINEAR
    )!

    this._cleanupBackgroundTexture = () =>
      glOut.deleteTexture(this._backgroundTexture)

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
        name: 'u_backgroundScale',
        type: 'float',
        values: [1, 1]
      },
      {
        name: 'u_backgroundOffset',
        type: 'float',
        values: [0, 0]
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

    const updateBackgroundTexture = () => {
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
        naturalWidth,
        naturalHeight,
        glOut.RGBA,
        glOut.UNSIGNED_BYTE,
        backgroundImage
      )

      const { height, width } = glOut.canvas
      const outputRatio = width / height
      let xOffset = 0
      let yOffset = 0
      let backgroundWidth = naturalWidth
      let backgroundHeight = naturalHeight
      const backgroundRatio = backgroundWidth / backgroundHeight

      if (backgroundRatio < outputRatio) {
        backgroundHeight = backgroundWidth / outputRatio
        yOffset = (naturalHeight - backgroundHeight) / 2
      } else {
        backgroundWidth = backgroundHeight * outputRatio
        xOffset = (naturalWidth - backgroundWidth) / 2
      }

      const xScale = backgroundWidth / naturalWidth
      const yScale = backgroundHeight / naturalHeight
      xOffset /= naturalWidth
      yOffset /= naturalHeight

      this._setUniformVars([
        {
          name: 'u_backgroundScale',
          type: 'float',
          values: [xScale, yScale]
        },
        {
          name: 'u_backgroundOffset',
          type: 'float',
          values: [xOffset, yOffset]
        }
      ])
    }

    if (backgroundImage.complete) {
      updateBackgroundTexture()
    } else {
      backgroundImage.onload = updateBackgroundTexture
    }
  }

  cleanUp(): void {
    super.cleanUp()
    this._cleanupBackgroundTexture()
  }

  render(): void {
    const { _benchmark } = this
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

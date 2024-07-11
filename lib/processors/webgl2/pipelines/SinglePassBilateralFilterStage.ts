import { Dimensions } from '../../../types'
import { WebGL2Pipeline } from './WebGL2Pipeline'

function createSpaceWeights(
  radius: number,
  sigma: number,
  texelSize: number
): number[] {
  return '0'.repeat(radius).split('').map((zero, i) => {
    const x = (i + 1) * texelSize
    return Math.exp(-0.5 * x * x / sigma / sigma)
  })
}

/**
 * @private
 */
export class SinglePassBilateralFilterStage extends WebGL2Pipeline.ProcessingStage {
  private _direction: 'horizontal' | 'vertical'
  private _inputDimensions: Dimensions

  constructor(
    glOut: WebGL2RenderingContext,
    direction: 'horizontal' | 'vertical',
    outputType: 'canvas' | 'texture',
    inputDimensions: Dimensions,
    outputDimensions: Dimensions,
    inputTextureUnit: number,
    outputTextureUnit = inputTextureUnit + 1
  ) {
    const {
      height,
      width
    } = outputDimensions

    super(
      {
        textureName: 'u_segmentationMask',
        textureUnit: inputTextureUnit
      },
      {
        fragmentShaderSource: `#version 300 es
          precision highp float;

          uniform sampler2D u_inputFrame;
          uniform sampler2D u_segmentationMask;
          uniform vec2 u_texelSize;
          uniform float u_direction;
          uniform float u_radius;
          uniform float u_sigmaTexel;
          uniform float u_sigmaColor;
          uniform float u_spaceWeights[128];
      
          in vec2 v_texCoord;

          out vec4 outColor;
      
          float gaussian(float x, float sigma) {
            return exp(-0.5 * x * x / sigma / sigma);
          }
      
          float calculateColorWeight(vec2 coord) {
            vec3 centerColor = texture(u_inputFrame, v_texCoord).rgb;
            vec3 coordColor = texture(u_inputFrame, coord).rgb;
            float x = distance(centerColor, coordColor);
            float sigma = u_sigmaColor;
            return gaussian(x, sigma);
          }

          float edgePixelsAverageAlpha() {
            float totalAlpha = texture(u_segmentationMask, v_texCoord).a;
            float totalPixels = 1.0;

            for (float i = -u_radius; u_radius > 0.0 && i <= u_radius; i += u_radius) {
              for (float j = -u_radius; j <= u_radius; j += u_radius * (j == 0.0 ? 2.0 : 1.0)) {
                vec2 shift = vec2(i, j) * u_texelSize;
                vec2 coord = vec2(v_texCoord + shift);
                totalAlpha += texture(u_segmentationMask, coord).a;
                totalPixels++;
              }
            }

            return totalAlpha / totalPixels;
          }

          void main() {
            float averageAlpha = edgePixelsAverageAlpha();

            if (averageAlpha == 0.0 || averageAlpha == 1.0) {
              outColor = vec4(vec3(0.0), averageAlpha);
              return;
            }

            float outAlpha = texture(u_segmentationMask, v_texCoord).a;
            float totalWeight = 1.0;

            for (float i = 1.0; i <= u_radius; i++) {
              float x = (1.0 - u_direction) * i;
              float y = u_direction * i;
              vec2 shift = vec2(x, y) * u_texelSize;
              vec2 coord = vec2(v_texCoord + shift);
              float spaceWeight = u_spaceWeights[int(i - 1.0)];
              float colorWeight = calculateColorWeight(coord);
              float weight = spaceWeight * colorWeight;
              float alpha = texture(u_segmentationMask, coord).a;
              totalWeight += weight;
              outAlpha += weight * alpha;
  
              shift = vec2(-x, -y) * u_texelSize;
              coord = vec2(v_texCoord + shift);
              colorWeight = calculateColorWeight(coord);
              weight = spaceWeight * colorWeight;
              alpha = texture(u_segmentationMask, coord).a;
              totalWeight += weight;
              outAlpha += weight * alpha;
            }
  
            outAlpha /= totalWeight;      
            outColor = vec4(vec3(0.0), outAlpha);
          }
        `,
        glOut,
        height,
        textureUnit: outputTextureUnit,
        type: outputType,
        width,
        uniformVars: [
          {
            name: 'u_inputFrame',
            type: 'int',
            values: [0]
          },
          {
            name: 'u_direction',
            type: 'float',
            values: [direction === 'vertical' ? 1 : 0]
          },
          {
            name: 'u_texelSize',
            type: 'float',
            values: [1 / width, 1 / height]
          }
        ]
      }
    )

    this._direction = direction
    this._inputDimensions = inputDimensions
    this.updateSigmaColor(0)
    this.updateSigmaSpace(0)
  }

  updateSigmaColor(sigmaColor: number): void {
    this._setUniformVars([
      {
        name: 'u_sigmaColor',
        type: 'float',
        values: [sigmaColor]
      }
    ])
  }

  updateSigmaSpace(sigmaSpace: number): void {
    const {
      height: inputHeight,
      width: inputWidth
    } = this._inputDimensions

    const {
      height: outputHeight,
      width: outputWidth
    } = this._outputDimensions

    sigmaSpace *= Math.max(
      outputWidth / inputWidth,
      outputHeight / inputHeight
    )

    const sigmaTexel = Math.max(
      1 / outputWidth,
      1 / outputHeight
    ) * sigmaSpace

    const texelSize = 1 / (
      this._direction === 'horizontal'
        ? outputWidth
        : outputHeight
    )

    this._setUniformVars([
      {
        name: 'u_radius',
        type: 'float',
        values: [sigmaSpace]
      },
      {
        name: 'u_sigmaTexel',
        type: 'float',
        values: [sigmaTexel]
      },
      {
        name: 'u_spaceWeights',
        type: 'float:v',
        values: createSpaceWeights(
          sigmaSpace,
          sigmaTexel,
          texelSize
        )
      },
    ])
  }
}

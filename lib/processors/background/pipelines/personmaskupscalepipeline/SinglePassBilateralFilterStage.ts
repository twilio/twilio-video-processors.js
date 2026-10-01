import { Dimensions } from '../../../../types';
import { WebGL2Pipeline } from '../../../pipelines';

// Stands in for -Infinity at sigma 0, so only taps at zero distance keep any
// weight. Must stay float32-representable: uniform1f would turn anything larger
// into -Infinity, and x * x * -Infinity is NaN or 0 depending on the driver.
const SIGMA_ZERO_COEFFICIENT = -1e30;

/**
 * @private
 * Gaussian x^2 coefficient, -0.5 / sigma^2.
 */
function negInvTwoSigmaSq(sigma: number): number {
  return sigma > 0
    ? -0.5 / (sigma * sigma)
    : SIGMA_ZERO_COEFFICIENT;
}

/**
 * @private
 */
export class SinglePassBilateralFilterStage extends WebGL2Pipeline.ProcessingStage {
  private readonly _inputDimensions: Dimensions;

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
    } = outputDimensions;

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
          uniform float u_step;
          // -0.5 / sigma^2, so a tap costs one exp() and no division.
          uniform float u_negInvTwoSigmaSqColor;
          uniform float u_negInvTwoSigmaSqTexel;

          in vec2 v_texCoord;

          out vec4 outColor;

          float calculateColorWeight(vec2 coord, vec3 centerColor) {
            vec3 coordColor = texture(u_inputFrame, coord).rgb;
            float x = distance(centerColor, coordColor);
            return exp(x * x * u_negInvTwoSigmaSqColor);
          }

          float calculateSpaceWeight(float i) {
            // x along a horizontal pass, y along a vertical one.
            float texelStep = mix(u_texelSize.x, u_texelSize.y, u_direction);
            float x = i * texelStep;
            return exp(x * x * u_negInvTwoSigmaSqTexel);
          }

          float edgePixelsAverageAlpha(float outAlpha) {
            float totalAlpha = outAlpha;
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
            vec3 centerColor = texture(u_inputFrame, v_texCoord).rgb;
            float outAlpha = texture(u_segmentationMask, v_texCoord).a;
            float averageAlpha = edgePixelsAverageAlpha(outAlpha);
            float totalWeight = 1.0;

            if (averageAlpha == 0.0 || averageAlpha == 1.0) {
              outColor = vec4(averageAlpha * centerColor, averageAlpha);
              return;
            }

            for (float i = 1.0; i <= u_radius; i += u_step) {
              float x = (1.0 - u_direction) * i;
              float y = u_direction * i;
              vec2 shift = vec2(x, y) * u_texelSize;
              vec2 coord = vec2(v_texCoord + shift);
              float spaceWeight = calculateSpaceWeight(i);
              float colorWeight = calculateColorWeight(coord, centerColor);
              float weight = spaceWeight * colorWeight;
              float alpha = texture(u_segmentationMask, coord).a;
              totalWeight += weight;
              outAlpha += weight * alpha;

              shift = vec2(-x, -y) * u_texelSize;
              coord = vec2(v_texCoord + shift);
              colorWeight = calculateColorWeight(coord, centerColor);
              weight = spaceWeight * colorWeight;
              alpha = texture(u_segmentationMask, coord).a;
              totalWeight += weight;
              outAlpha += weight * alpha;
            }

            outAlpha /= totalWeight;
            outColor = vec4(outAlpha * centerColor, outAlpha);
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
    );

    this._inputDimensions = inputDimensions;
    this.updateSigmaColor(0);
    this.updateSigmaSpace(0);
  }

  updateSigmaColor(sigmaColor: number): void {
    this._setUniformVars([
      {
        name: 'u_negInvTwoSigmaSqColor',
        type: 'float',
        values: [negInvTwoSigmaSq(sigmaColor)]
      }
    ]);
  }

  updateSigmaSpace(sigmaSpace: number): void {
    const {
      height: inputHeight,
      width: inputWidth
    } = this._inputDimensions;

    const {
      height: outputHeight,
      width: outputWidth
    } = this._outputDimensions;

    sigmaSpace *= Math.max(
      outputWidth / inputWidth,
      outputHeight / inputHeight
    );

    const step = Math.floor(
      0.5 * sigmaSpace / Math.log(sigmaSpace)
    );

    const sigmaTexel = Math.max(
      1 / outputWidth,
      1 / outputHeight
    ) * sigmaSpace;

    this._setUniformVars([
      {
        name: 'u_radius',
        type: 'float',
        values: [sigmaSpace]
      },
      {
        name: 'u_negInvTwoSigmaSqTexel',
        type: 'float',
        values: [negInvTwoSigmaSq(sigmaTexel)]
      },
      {
        name: 'u_step',
        type: 'float',
        values: [step]
      }
    ]);
  }
}

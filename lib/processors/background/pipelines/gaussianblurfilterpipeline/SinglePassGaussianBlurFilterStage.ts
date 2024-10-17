import { WebGL2Pipeline } from '../../../pipelines';

/**
 * @private
 */
function createGaussianBlurWeights(radius: number): number[] {
  const coeff = 1.0 / Math.sqrt(2.0 * Math.PI) / radius;
  return '0'.repeat(radius + 1).split('').map((zero, x) => {
    return coeff * Math.exp(-0.5 * x * x / radius / radius);
  });
}

/**
 * @private
 */
export class SinglePassGaussianBlurFilterStage extends WebGL2Pipeline.ProcessingStage {
  constructor(
    glOut: WebGL2RenderingContext,
    direction: 'horizontal' | 'vertical',
    outputType: 'canvas' | 'texture',
    inputTextureUnit: number,
    outputTextureUnit = inputTextureUnit + 1
  ) {
    const {
      height,
      width
    } = glOut.canvas;

    super(
      {
        textureName: 'u_inputTexture',
        textureUnit: inputTextureUnit
      },
      {
        fragmentShaderSource: `#version 300 es
          precision highp float;

          uniform sampler2D u_inputTexture;
          uniform vec2 u_texelSize;
          uniform float u_direction;
          uniform float u_radius;
          uniform float u_gaussianBlurWeights[128];

          in vec2 v_texCoord;

          out vec4 outColor;

          void main() {
            float totalWeight = u_gaussianBlurWeights[0];
            vec3 newColor = totalWeight * texture(u_inputTexture, v_texCoord).rgb;

            for (float i = 1.0; i <= u_radius; i += 1.0) {
              float x = (1.0 - u_direction) * i;
              float y = u_direction * i;

              vec2 shift = vec2(x, y) * u_texelSize;
              vec2 coord = vec2(v_texCoord + shift);
              float weight = u_gaussianBlurWeights[int(i)];
              newColor += weight * texture(u_inputTexture, coord).rgb;
              totalWeight += weight;

              shift = vec2(-x, -y) * u_texelSize;
              coord = vec2(v_texCoord + shift);
              newColor += weight * texture(u_inputTexture, coord).rgb;
              totalWeight += weight;
            }

            newColor /= totalWeight;
            outColor = vec4(newColor, 1.0);
          }
        `,
        glOut,
        height,
        textureUnit: outputTextureUnit,
        type: outputType,
        width,
        uniformVars: [
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

    this.updateRadius(0);
  }

  updateRadius(radius: number): void {
    this._setUniformVars([
      {
        name: 'u_radius',
        type: 'float',
        values: [radius]
      },
      {
        name: 'u_gaussianBlurWeights',
        type: 'float:v',
        values: createGaussianBlurWeights(radius)
      }
    ]);
  }
}

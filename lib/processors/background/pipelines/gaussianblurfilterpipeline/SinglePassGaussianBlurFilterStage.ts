import { WebGL2Pipeline } from '../../../pipelines';

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
          // -0.5 / radius^2. Weights are evaluated per tap, so the radius has
          // no upper bound; the Gaussian's scale factor cancels in totalWeight.
          uniform float u_negInvTwoSigmaSq;

          in vec2 v_texCoord;

          out vec4 outColor;

          void main() {
            float totalWeight = 1.0;
            vec3 newColor = texture(u_inputTexture, v_texCoord).rgb;

            for (float i = 1.0; i <= u_radius; i += 1.0) {
              float x = (1.0 - u_direction) * i;
              float y = u_direction * i;

              vec2 shift = vec2(x, y) * u_texelSize;
              vec2 coord = vec2(v_texCoord + shift);
              float weight = exp(i * i * u_negInvTwoSigmaSq);
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
        name: 'u_negInvTwoSigmaSq',
        type: 'float',
        values: [-0.5 / (radius * radius)]
      }
    ]);
  }
}

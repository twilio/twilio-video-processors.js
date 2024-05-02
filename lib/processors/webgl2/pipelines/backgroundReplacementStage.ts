import { WebGL2Pipeline } from './webgl2pipeline'

export class BackgroundReplacementStage extends WebGL2Pipeline.ProcessingStage {
  constructor(
    glOut: WebGL2RenderingContext,
    width: number,
    height: number
  ) {
    super(
      {
        textureName: 'u_segmentationMask',
        textureUnit: 1
      },
      {
        fragmentShaderSource: `#version 300 es
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
              outColor = vec4(centerColor, 0.0);
            } else if (totalSegAlpha >= 4.0) {
              outColor = vec4(centerColor, 1.0);
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

              outColor = vec4(centerColor, newVal);
            }
          }
        `,
        glOut,
        height,
        type: 'canvas',
        width,
        uniformVars: [
          {
            name: 'u_inputFrame',
            type: 'int',
            values: [0]
          },
          {
            name: 'u_offset',
            type: 'float',
            values: [0]
          },
          {
            name: 'u_radius',
            type: 'float',
            values: [0]
          },
          {
            name: 'u_sigmaColor',
            type: 'float',
            values: [0]
          },
          {
            name: 'u_sigmaTexel',
            type: 'float',
            values: [0]
          },
          {
            name: 'u_step',
            type: 'float',
            values: [1]
          },

          {
            name: 'u_texelSize',
            type: 'float',
            values: [1 / width, 1 / height]
          }
        ]
      }
    )
  }
}

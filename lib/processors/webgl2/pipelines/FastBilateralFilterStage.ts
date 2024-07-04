import { Dimensions } from '../../../types'
import { WebGL2Pipeline } from './WebGL2Pipeline'

/**
 * @private
 */
export class FastBilateralFilterStage extends WebGL2Pipeline.ProcessingStage {
  private _inputDimensions: Dimensions

  constructor(
    glOut: WebGL2RenderingContext,
    inputDimensions: Dimensions,
    outputDimensions: Dimensions
  ) {
    const {
      height,
      width
    } = outputDimensions

    super(
      {
        textureName: 'u_segmentationMask',
        textureUnit: 1
      },
      {
        // NOTE(mmalavalli): This is a faster approximation of the joint bilateral filter.
        // For a given pixel, instead of calculating the space and color weights of all
        // the pixels within the filter kernel, which would have a complexity of O(r^2),
        // we calculate the space and color weights of only those pixels which form two
        // diagonal lines between the two pairs of opposite corners of the filter kernel,
        // which would have a complexity of O(r). This improves the overall complexity
        // of this stage from O(w x h x r^2) to O(w x h x r), where:
        // w => width of the output video frame
        // h => height of the output video frame
        // r => radius of the joint bilateral filter kernel
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
            return exp(-0.5 * x * x / sigma / sigma);
          }
      
          float calculateSpaceWeight(vec2 coord) {
            float x = distance(v_texCoord, coord);
            float sigma = u_sigmaTexel;
            return gaussian(x, sigma);
          }
      
          float calculateColorWeight(vec2 coord) {
            vec3 centerColor = texture(u_inputFrame, v_texCoord).rgb;
            vec3 coordColor = texture(u_inputFrame, coord).rgb;
            float x = distance(centerColor, coordColor);
            float sigma = u_sigmaColor;
            return gaussian(x, sigma);
          }
      
          void main() {
            vec3 centerColor = texture(u_inputFrame, v_texCoord).rgb;
            float newVal = 0.0;
            float totalWeight = 0.0;
      
            vec2 leftTopCoord = vec2(v_texCoord + vec2(-u_radius, -u_radius) * u_texelSize);
            vec2 rightTopCoord = vec2(v_texCoord + vec2(u_radius, -u_radius) * u_texelSize);
            vec2 leftBottomCoord = vec2(v_texCoord + vec2(-u_radius, u_radius) * u_texelSize);
            vec2 rightBottomCoord = vec2(v_texCoord + vec2(u_radius, u_radius) * u_texelSize);
      
            float leftTopSegAlpha = texture(u_segmentationMask, leftTopCoord).a;
            float rightTopSegAlpha = texture(u_segmentationMask, rightTopCoord).a;
            float leftBottomSegAlpha = texture(u_segmentationMask, leftBottomCoord).a;
            float rightBottomSegAlpha = texture(u_segmentationMask, rightBottomCoord).a;
            float totalSegAlpha = leftTopSegAlpha + rightTopSegAlpha + leftBottomSegAlpha + rightBottomSegAlpha;
      
            if (totalSegAlpha <= 0.0) {
              newVal = 0.0;
            } else if (totalSegAlpha >= 4.0) {
              newVal = 1.0;
            } else {
              for (float i = 0.0; i <= u_radius - u_offset; i += u_step) {
                vec2 shift = vec2(i, i) * u_texelSize;
                vec2 coord = vec2(v_texCoord + shift);
                float spaceWeight = calculateSpaceWeight(coord);
                float colorWeight = calculateColorWeight(coord);
                float weight = spaceWeight * colorWeight;
                float alpha = texture(u_segmentationMask, coord).a;
                totalWeight += weight;
                newVal += weight * alpha;
      
                if (i != 0.0) {
                  shift = vec2(i, -i) * u_texelSize;
                  coord = vec2(v_texCoord + shift);
                  colorWeight = calculateColorWeight(coord);
                  weight = spaceWeight * colorWeight;
                  alpha = texture(u_segmentationMask, coord).a;
                  totalWeight += weight;
                  newVal += weight * texture(u_segmentationMask, coord).a;
      
                  shift = vec2(-i, i) * u_texelSize;
                  coord = vec2(v_texCoord + shift);
                  colorWeight = calculateColorWeight(coord);
                  weight = spaceWeight * colorWeight;
                  alpha = texture(u_segmentationMask, coord).a;
                  totalWeight += weight;
                  newVal += weight * texture(u_segmentationMask, coord).a;
      
                  shift = vec2(-i, -i) * u_texelSize;
                  coord = vec2(v_texCoord + shift);
                  colorWeight = calculateColorWeight(coord);
                  weight = spaceWeight * colorWeight;
                  alpha = texture(u_segmentationMask, coord).a;
                  totalWeight += weight;
                  newVal += weight * texture(u_segmentationMask, coord).a;          
                }
              }
              newVal /= totalWeight;
            }
      
            outColor = vec4(vec3(0.0), newVal);
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
            name: 'u_texelSize',
            type: 'float',
            values: [1 / width, 1 / height]
          }
        ]
      }
    )

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

    const kSparsityFactor = 0.66
    const sparsity = Math.max(
      1,
      Math.sqrt(sigmaSpace)
      * kSparsityFactor
    )
    const step = sparsity
    const radius = sigmaSpace
    const offset = step > 1 ? step * 0.5 : 0
    const sigmaTexel = Math.max(
      1 / outputWidth,
      1 / outputHeight
    ) * sigmaSpace

    this._setUniformVars([
      {
        name: 'u_offset',
        type: 'float',
        values: [offset]
      },
      {
        name: 'u_radius',
        type: 'float',
        values: [radius]
      },
      {
        name: 'u_sigmaTexel',
        type: 'float',
        values: [sigmaTexel]
      },
      {
        name: 'u_step',
        type: 'float',
        values: [step]
      },
    ])
  }
}

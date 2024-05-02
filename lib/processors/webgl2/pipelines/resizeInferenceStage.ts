import { WebGL2Pipeline } from './webgl2pipeline';

export class ResizeInferenceStage extends WebGL2Pipeline.ProcessingStage {
  constructor(
    glOut: WebGL2RenderingContext,
    width: number,
    height: number,
    tflite: any
  ) {
    const tfliteInputMemoryOffset = tflite._getInputMemoryOffset() / 4
    const tfliteOutputMemoryOffset = tflite._getOutputMemoryOffset() / 4
    super(
      {
        textureName: 'u_inputFrame',
        textureUnit: 0
      },
      {
        fragmentShaderSource: `#version 300 es
          precision highp float;

          uniform sampler2D u_inputFrame;

          in vec2 v_texCoord;

          out vec4 outColor;

          void main() {
            outColor = texture(u_inputFrame, v_texCoord);
          }
        `,
        glOut,
        height,
        textureTransform: ({ data }) => {
          const nPixels = width * height;

          for (let i = 0; i < nPixels; i++) {
            const tfliteIndex = tfliteInputMemoryOffset + i * 3
            const outputIndex = i * 4
            tflite.HEAPF32[tfliteIndex] = data[outputIndex] / 255
            tflite.HEAPF32[tfliteIndex + 1] = data[outputIndex + 1] / 255
            tflite.HEAPF32[tfliteIndex + 2] = data[outputIndex + 2] / 255
          }

          tflite._runInference()

          for (let i = 0; i < nPixels; i++) {
            const tfliteIndex = tfliteOutputMemoryOffset + i
            const outputIndex = i * 4
            data[outputIndex + 3] = Math.round(tflite.HEAPF32[tfliteIndex] * 255)
          }
        },
        type: 'texture',
        width
      }
    )
  }
}

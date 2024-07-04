import { Dimensions } from '../../../types';
import { FastBilateralFilterConfig } from '../helpers/postProcessingHelper';
import { FastBilateralFilterStage } from './FastBilateralFilterStage';
import { WebGL2Pipeline } from './WebGL2Pipeline';

export class PersonMaskUpscalePipeline extends WebGL2Pipeline {
  constructor(
    inputCanvas: OffscreenCanvas | HTMLCanvasElement,
    inputDimensions: Dimensions,
    outputCanvas: OffscreenCanvas | HTMLCanvasElement
  ) {
    super()
    const glOut = outputCanvas.getContext('webgl2')! as WebGL2RenderingContext

    const outputDimensions = {
      height: outputCanvas.height,
      width: outputCanvas.width
    }

    this.addStage(new WebGL2Pipeline.InputStage(
      glOut,
      inputCanvas
    ))

    this.addStage(new FastBilateralFilterStage(
      glOut,
      inputDimensions,
      outputDimensions
    ))
  }

  updateFastBilateralFilterConfig(config: FastBilateralFilterConfig) {
    const [
      /* inputStage */,
      fastBilateralFilterStage
    ] = this._stages as [
      any,
      FastBilateralFilterStage
    ]

    const { sigmaSpace } = config
    if (typeof sigmaSpace === 'number') {
      fastBilateralFilterStage.updateSigmaColor(0.1)
      fastBilateralFilterStage.updateSigmaSpace(sigmaSpace)
    }
  }
}

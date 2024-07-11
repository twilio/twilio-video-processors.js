import { Dimensions } from '../../../types';
import { BilateralFilterConfig } from '../helpers/postProcessingHelper';
import { SinglePassBilateralFilterStage } from './SinglePassBilateralFilterStage';
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

    this.addStage(new SinglePassBilateralFilterStage(
      glOut,
      'horizontal',
      'texture',
      inputDimensions,
      outputDimensions,
      1,
      2
    ))

    this.addStage(new SinglePassBilateralFilterStage(
      glOut,
      'vertical',
      'canvas',
      inputDimensions,
      outputDimensions,
      2
    ))
  }

  updateFastBilateralFilterConfig(config: BilateralFilterConfig) {
    const [
      /* inputStage */,
      ...bilateralFilterStages
    ] = this._stages as [
      any,
      SinglePassBilateralFilterStage
    ]
    const { sigmaSpace } = config
    if (typeof sigmaSpace === 'number') {
      bilateralFilterStages.forEach(
        (stage: SinglePassBilateralFilterStage) => {
          stage.updateSigmaColor(0.1)
          stage.updateSigmaSpace(sigmaSpace)
        }
      )
    }
  }
}

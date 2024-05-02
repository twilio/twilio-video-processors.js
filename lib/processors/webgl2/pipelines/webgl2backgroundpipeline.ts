import {
  inputResolutions,
  SegmentationConfig,
} from '../helpers/segmentationHelper'
import { BackgroundReplacementStage } from './backgroundReplacementStage'
import { ResizeInferenceStage } from './resizeInferenceStage'
import { WebGL2Pipeline } from './webgl2pipeline'

class WebGL2BackgroundPipeline extends WebGL2Pipeline {
  private _benchmark: any

  constructor(
    videoIn: HTMLVideoElement,
    segmentationConfig: SegmentationConfig,
    canvas: HTMLCanvasElement,
    tflite: any,
    benchmark: any
  ) {
    super()
    this._benchmark = benchmark

    const glOut = canvas.getContext('webgl2')!

    const {
      videoHeight,
      videoWidth
    } = videoIn

    const [
      segmentationWidth,
      segmentationHeight
    ] = inputResolutions[
      segmentationConfig.inputResolution
    ]

    this.addStage(new WebGL2Pipeline.InputStage(
      videoIn as HTMLVideoElement,
      glOut
    ))

    this.addStage(new ResizeInferenceStage(
      glOut,
      segmentationWidth,
      segmentationHeight,
      tflite
    ))

    this.addStage(new BackgroundReplacementStage(
      glOut,
      videoWidth,
      videoHeight
    ))
  }
}

export function buildWebGL2Pipeline(
  videoIn: HTMLVideoElement,
  segmentationConfig: SegmentationConfig,
  canvas: HTMLCanvasElement,
  tflite: any,
  benchmark: any
) {
  return new WebGL2BackgroundPipeline(
    videoIn,
    segmentationConfig,
    canvas,
    tflite,
    benchmark
  )
}

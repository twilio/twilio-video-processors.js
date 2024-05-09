import { PostProcessingConfig } from '../helpers/postProcessingHelper'
import { inputResolutions, SegmentationConfig } from '../helpers/segmentationHelper'
import { BackgroundBlurStage } from './backgroundBlurStage'
import { BackgroundImageStage } from './backgroundImageStage'
import { PersonMaskInferenceStage } from './personMaskInferenceStage'
import { PersonMaskUpscaleStage } from './personMaskUpscaleStage'
import { WebGL2Pipeline } from './webgl2pipeline'

class WebGL2BackgroundPipeline extends WebGL2Pipeline {
  private _benchmark: any;
  private _debounce: boolean;
  private _skipPersonMaskCreation: boolean;

  constructor(
    videoIn: HTMLVideoElement,
    segmentationConfig: SegmentationConfig,
    backgroundImage: HTMLImageElement | null,
    canvas: HTMLCanvasElement,
    tflite: any,
    benchmark: any,
    debounce: boolean
  ) {
    super()

    this._benchmark = benchmark
    this._debounce = debounce
    this._skipPersonMaskCreation = false

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

    this.addStage(new PersonMaskInferenceStage(
      glOut,
      {
        height: segmentationHeight,
        width: segmentationWidth
      },
      tflite,
      benchmark
    ))

    this.addStage(new PersonMaskUpscaleStage(
      glOut,
      {
        height: segmentationHeight,
        width: segmentationWidth
      },
      {
        height: videoHeight,
        width: videoWidth
      },
      benchmark
    ))

    const backgroundStage = backgroundImage
      ? new BackgroundImageStage(
          glOut,
          backgroundImage,
          benchmark
        )
      : new BackgroundBlurStage(
          glOut,
          videoIn,
          benchmark
        )

      this.addStage(backgroundStage)
  }

  render(): void {
    const [
      videoInputStage,
      personMaskInferenceStage,
      personMaskUpscaleStage,
      backgroundStage
    ] = this._stages

    videoInputStage.render()

    if (!this._skipPersonMaskCreation) {
      personMaskInferenceStage.render()
      personMaskUpscaleStage.render()
    } else {
      this._benchmark.start('imageCompositionDelay')
    }

    backgroundStage.render()

    this._skipPersonMaskCreation = this._debounce
      ? !this._skipPersonMaskCreation
      : false
  }

  updatePostProcessingConfig(config: PostProcessingConfig) {
    const [
      /* video input stage */,
      /* person mask inference stage */,
      personMaskUpscaleStage,
      backgroundStage
    ] = this._stages as [
      any,
      any,
      PersonMaskUpscaleStage,
      BackgroundBlurStage | BackgroundImageStage
    ]

    const {
      blendMode,
      coverage,
      jointBilateralFilter: {
        sigmaColor,
        sigmaSpace
      },
      lightWrapping
    } = config

    personMaskUpscaleStage.updateSigmaColor(sigmaColor)
    personMaskUpscaleStage.updateSigmaSpace(sigmaSpace)
    backgroundStage.updateBlendMode(blendMode)
    backgroundStage.updateCoverage(coverage)
    backgroundStage.updateLightWrapping(lightWrapping)
  }
}

export function buildWebGL2Pipeline(
  videoIn: HTMLVideoElement,
  segmentationConfig: SegmentationConfig,
  backgroundImage: HTMLImageElement | null,
  canvas: HTMLCanvasElement,
  tflite: any,
  benchmark: any,
  debounce: boolean
) {
  return new WebGL2BackgroundPipeline(
    videoIn,
    segmentationConfig,
    backgroundImage,
    canvas,
    tflite,
    benchmark,
    debounce
  )
}

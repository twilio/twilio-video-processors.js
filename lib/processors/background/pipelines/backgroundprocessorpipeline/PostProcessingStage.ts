import { HYSTERESIS_HIGH, HYSTERESIS_LOW } from '../../../../constants';
import { Dimensions, HysteresisConfig, InputFrame } from '../../../../types';
import { Pipeline } from '../../../pipelines';
import { PersonMaskUpscalePipeline } from '../personmaskupscalepipeline';

/**
 * @private
 */
export class PostProcessingStage implements Pipeline.Stage {
  private _hysteresisEnabled: boolean;
  private _hysteresisHigh: number;
  private _hysteresisLow: number;
  private readonly _inputDimensions: Dimensions;
  private _maskBlurRadius: number;
  private readonly _outputContext: OffscreenCanvasRenderingContext2D;
  private _personMaskUpscalePipeline: PersonMaskUpscalePipeline | null = null;
  private _prevMaskData: Uint8ClampedArray | null = null;
  private readonly _setBackground: (inputFrame?: InputFrame) => void;
  private readonly _webgl2Canvas: OffscreenCanvas;

  constructor(
    inputDimensions: Dimensions,
    webgl2Canvas: OffscreenCanvas,
    outputCanvas: OffscreenCanvas,
    maskBlurRadius: number,
    setBackground: (inputFrame?: InputFrame) => void,
    hysteresis: false | HysteresisConfig = { high: HYSTERESIS_HIGH, low: HYSTERESIS_LOW }
  ) {
    this._hysteresisEnabled = hysteresis !== false;
    this._hysteresisHigh = hysteresis ? hysteresis.high : HYSTERESIS_HIGH;
    this._hysteresisLow = hysteresis ? hysteresis.low : HYSTERESIS_LOW;
    this._inputDimensions = inputDimensions;
    this._maskBlurRadius = maskBlurRadius;
    this._outputContext = outputCanvas.getContext('2d')!;
    this._webgl2Canvas = webgl2Canvas;
    this._setBackground = setBackground;
  }

  render(
    inputFrame: InputFrame,
    personMask: ImageData
  ): void {
    const {
      _outputContext,
      _setBackground,
      _webgl2Canvas
    } = this;
    if (this._hysteresisEnabled) {
      this._applyHysteresis(personMask);
    }
    if (!this._personMaskUpscalePipeline) {
      this.resetPersonMaskUpscalePipeline();
    }
    this._personMaskUpscalePipeline!.render(
      inputFrame,
      personMask
    );
    _outputContext.save();
    _outputContext.globalCompositeOperation = 'copy';
    _outputContext.drawImage(
      _webgl2Canvas,
      0,
      0
    );
    _outputContext.globalCompositeOperation = 'destination-over';
    _setBackground(inputFrame);
    _outputContext.restore();
  }

  resetPersonMaskUpscalePipeline(): void {
    const {
      _inputDimensions,
      _maskBlurRadius,
      _webgl2Canvas
    } = this;
    this._personMaskUpscalePipeline?.cleanUp();
    this._personMaskUpscalePipeline = new PersonMaskUpscalePipeline(
      _inputDimensions,
      _webgl2Canvas,
      _maskBlurRadius
    );
    this._personMaskUpscalePipeline.updateBilateralFilterConfig({
      sigmaSpace: _maskBlurRadius
    });
  }

  updateHysteresis(config: false | HysteresisConfig): void {
    if (config === false) {
      this._hysteresisEnabled = false;
      this._prevMaskData = null;
    } else {
      const thresholdsChanged = this._hysteresisHigh !== config.high
        || this._hysteresisLow !== config.low;
      this._hysteresisEnabled = true;
      this._hysteresisHigh = config.high;
      this._hysteresisLow = config.low;
      if (thresholdsChanged) {
        this._prevMaskData = null;
      }
    }
  }

  updateMaskBlurRadius(radius: number): void {
    if (this._maskBlurRadius !== radius) {
      this._maskBlurRadius = radius;
      this._personMaskUpscalePipeline
        ?.updateBilateralFilterConfig({
          sigmaSpace: radius
        });
    }
  }

  private _applyHysteresis(personMask: ImageData): void {
    const { data } = personMask;
    const { _hysteresisHigh, _hysteresisLow } = this;
    const pixelCount = data.length / 4;
    const hasPrev = this._prevMaskData?.length === pixelCount;
    if (!hasPrev) {
      this._prevMaskData = new Uint8ClampedArray(pixelCount);
    }
    const prevMask = this._prevMaskData!;
    for (let i = 3, j = 0; i < data.length; i += 4, j++) {
      if (data[i] >= _hysteresisHigh) {
        data[i] = 255;
      } else if (data[i] <= _hysteresisLow) {
        data[i] = 0;
      } else if (hasPrev) {
        data[i] = prevMask[j];
      }
      prevMask[j] = data[i];
    }
  }
}

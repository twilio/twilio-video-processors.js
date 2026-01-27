import { HYSTERESIS_HIGH, HYSTERESIS_LOW, SIGMA_COLOR } from '../../../../constants';
import { Dimensions, InputFrame } from '../../../../types';
import { Pipeline } from '../../../pipelines';
import { PersonMaskUpscalePipeline } from '../personmaskupscalepipeline';

/**
 * @private
 */
export interface PostProcessingStageOptions {
  hysteresisEnabled?: boolean;
  hysteresisHigh?: number;
  hysteresisLow?: number;
  sigmaColor?: number;
  skipPostProcessing?: boolean;
}

/**
 * @private
 */
export class PostProcessingStage implements Pipeline.Stage {
  private _hysteresisEnabled: boolean = false;
  private _hysteresisHigh: number = HYSTERESIS_HIGH;
  private _hysteresisLow: number = HYSTERESIS_LOW;
  private readonly _inputDimensions: Dimensions;
  private _maskBlurRadius: number;
  private readonly _outputCanvas: OffscreenCanvas;
  private readonly _outputContext: OffscreenCanvasRenderingContext2D;
  private _personMaskUpscalePipeline: PersonMaskUpscalePipeline | null = null;
  private _prevMaskData: Uint8ClampedArray | null = null;
  private readonly _setBackground: (inputFrame?: InputFrame) => void;
  private _sigmaColor: number = SIGMA_COLOR;
  private _skipPostProcessing: boolean = false;
  private readonly _webgl2Canvas: OffscreenCanvas;

  constructor(
    inputDimensions: Dimensions,
    webgl2Canvas: OffscreenCanvas,
    outputCanvas: OffscreenCanvas,
    maskBlurRadius: number,
    setBackground: (inputFrame?: InputFrame) => void,
    options: PostProcessingStageOptions = {}
  ) {
    this._inputDimensions = inputDimensions;
    this._maskBlurRadius = maskBlurRadius;
    this._outputCanvas = outputCanvas;
    this._outputContext = outputCanvas.getContext('2d')!;
    this._webgl2Canvas = webgl2Canvas;
    this._setBackground = setBackground;

    if (options.hysteresisEnabled !== undefined) {
      this._hysteresisEnabled = options.hysteresisEnabled;
    }
    if (options.hysteresisLow !== undefined) {
      this._hysteresisLow = options.hysteresisLow;
    }
    if (options.hysteresisHigh !== undefined) {
      this._hysteresisHigh = options.hysteresisHigh;
    }
    if (options.sigmaColor !== undefined) {
      this._sigmaColor = options.sigmaColor;
    }
    if (options.skipPostProcessing !== undefined) {
      this._skipPostProcessing = options.skipPostProcessing;
    }
  }

  render(
    inputFrame: InputFrame,
    personMask: ImageData
  ): void {
    const {
      _outputContext,
      _setBackground,
      _skipPostProcessing,
      _webgl2Canvas
    } = this;

    if (_skipPostProcessing) {
      this._renderRawMask(personMask);
      return;
    }

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

  private _applyHysteresis(personMask: ImageData): void {
    const { data } = personMask;
    const { _hysteresisHigh, _hysteresisLow, _prevMaskData } = this;

    for (let i = 3; i < data.length; i += 4) {
      const alpha = data[i];
      if (alpha > _hysteresisHigh) {
        data[i] = 255;
      } else if (alpha < _hysteresisLow) {
        data[i] = 0;
      } else if (_prevMaskData) {
        data[i] = _prevMaskData[i];
      }
    }

    if (!this._prevMaskData || this._prevMaskData.length !== data.length) {
      this._prevMaskData = new Uint8ClampedArray(data.length);
    }
    this._prevMaskData.set(data);
  }

  private _renderRawMask(personMask: ImageData): void {
    const { _outputCanvas, _outputContext } = this;
    const tempCanvas = new OffscreenCanvas(personMask.width, personMask.height);
    const tempCtx = tempCanvas.getContext('2d')!;
    tempCtx.putImageData(personMask, 0, 0);
    _outputContext.save();
    _outputContext.globalCompositeOperation = 'copy';
    _outputContext.drawImage(tempCanvas, 0, 0, _outputCanvas.width, _outputCanvas.height);
    _outputContext.restore();
  }

  resetPersonMaskUpscalePipeline(): void {
    const {
      _inputDimensions,
      _maskBlurRadius,
      _sigmaColor,
      _webgl2Canvas
    } = this;
    this._personMaskUpscalePipeline?.cleanUp();
    this._personMaskUpscalePipeline = new PersonMaskUpscalePipeline(
      _inputDimensions,
      _webgl2Canvas,
      _maskBlurRadius
    );
    this._personMaskUpscalePipeline.updateBilateralFilterConfig({
      sigmaColor: _sigmaColor,
      sigmaSpace: _maskBlurRadius
    });
  }

  updateHysteresisEnabled(enabled: boolean): void {
    this._hysteresisEnabled = enabled;
    if (!enabled) {
      this._prevMaskData = null;
    }
  }

  updateHysteresisHigh(high: number): void {
    this._hysteresisHigh = high;
  }

  updateHysteresisLow(low: number): void {
    this._hysteresisLow = low;
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

  updateSigmaColor(sigmaColor: number): void {
    if (this._sigmaColor !== sigmaColor) {
      this._sigmaColor = sigmaColor;
      this._personMaskUpscalePipeline
        ?.updateBilateralFilterConfig({
          sigmaColor
        });
    }
  }

  updateSkipPostProcessing(skip: boolean): void {
    this._skipPostProcessing = skip;
  }
}

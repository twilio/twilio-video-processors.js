import { Dimensions, InputFrame } from '../../../../types';
import { Pipeline } from '../../../pipelines';
import { PersonMaskUpscalePipeline } from '../personmaskupscalepipeline';

/**
 * @private
 */
export class PostProcessingStage implements Pipeline.Stage {
  private readonly _inputDimensions: Dimensions;
  private _maskBlurRadius: number;
  private readonly _outputContext: OffscreenCanvasRenderingContext2D;
  private _personMaskUpscalePipeline: PersonMaskUpscalePipeline | null = null;
  private readonly _setBackground: (inputFrame?: InputFrame, webgl2Canvas?: OffscreenCanvas) => void;
  private readonly _webgl2Canvas: OffscreenCanvas;

  constructor(
    inputDimensions: Dimensions,
    webgl2Canvas: OffscreenCanvas,
    outputCanvas: OffscreenCanvas,
    maskBlurRadius: number,
    setBackground: (inputFrame?: InputFrame, webgl2Canvas?: OffscreenCanvas) => void
  ) {
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
      _inputDimensions,
      _maskBlurRadius,
      _outputContext,
      _setBackground,
      _webgl2Canvas
    } = this;

    if (!this._personMaskUpscalePipeline) {
      this._personMaskUpscalePipeline = new PersonMaskUpscalePipeline(
        _inputDimensions,
        _webgl2Canvas
      );
      this._personMaskUpscalePipeline.updateBilateralFilterConfig({
        sigmaSpace: _maskBlurRadius
      });
    }

    this._personMaskUpscalePipeline.render(
      inputFrame,
      personMask
    );

    _outputContext.save();
    _outputContext.filter = 'none';
    _outputContext.globalCompositeOperation = 'copy';
    _outputContext.drawImage(
      _webgl2Canvas,
      0,
      0
    );
    _outputContext.globalCompositeOperation = 'source-in';
    _outputContext.drawImage(
      inputFrame,
      0,
      0
    );
    _outputContext.globalCompositeOperation = 'destination-over';
    _setBackground(inputFrame, _webgl2Canvas);
    _outputContext.restore();
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
}

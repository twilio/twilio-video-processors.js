import { InputFrame } from '../../../../types';
import { isCanvasBlurSupported } from '../../../../utils/support';
import { GaussianBlurFilterPipeline } from '../gaussianblurfilterpipeline';
import { BackgroundProcessorPipeline, BackgroundProcessorPipelineOptions } from './BackgroundProcessorPipeline';

/**
 * @private
 */
export interface GaussianBlurBackgroundProcessorPipelineOptions extends BackgroundProcessorPipelineOptions {
  blurFilterRadius: number;
}

/**
 * @private
 */
export class GaussianBlurBackgroundProcessorPipeline extends BackgroundProcessorPipeline {
  private _blurFilterRadius: number;
  private _gaussianBlurFilterPipeline: GaussianBlurFilterPipeline | null = null;

  constructor(options: GaussianBlurBackgroundProcessorPipelineOptions) {
    super(
      options,
      () => this._resetGaussianBlurFilterPipeline()
    );

    const {
      blurFilterRadius
    } = options;

    this._blurFilterRadius = blurFilterRadius;
  }

  async setBlurFilterRadius(radius: number): Promise<void> {
    this._blurFilterRadius = radius;
    return this._gaussianBlurFilterPipeline?.updateRadius(
      this._blurFilterRadius
    );
  }

  protected _setBackground(inputFrame: InputFrame): void {
    const {
      _blurFilterRadius,
      _outputCanvas,
      _webgl2Canvas
    } = this;

    const ctx = _outputCanvas.getContext('2d')!;
    if (isCanvasBlurSupported) {
      ctx.filter = `blur(${_blurFilterRadius}px)`;
      ctx.drawImage(
        inputFrame,
        0,
        0
      );
      ctx.filter = 'none';
      return;
    }
    if (!this._gaussianBlurFilterPipeline) {
      this._resetGaussianBlurFilterPipeline();
    }
    this._gaussianBlurFilterPipeline!.render();
    ctx.drawImage(
      _webgl2Canvas,
      0,
      0
    );
  }

  private _resetGaussianBlurFilterPipeline(): void {
    const {
      _blurFilterRadius,
      _webgl2Canvas
    } = this;
    this._gaussianBlurFilterPipeline?.cleanUp();
    this._gaussianBlurFilterPipeline = new GaussianBlurFilterPipeline(
      _webgl2Canvas
    );
    this._gaussianBlurFilterPipeline!.updateRadius(
      _blurFilterRadius
    );
  }
}

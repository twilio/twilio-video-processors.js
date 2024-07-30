import { InputFrame } from '../../../../types';
import { isCanvasBlurSupported } from '../../../../utils/support';
import { GaussianBlurFilterPipeline } from '../gaussianblurfilterpipeline';
import { BackgroundProcessorPipeline, BackgroundProcessorPipelineOptions } from './BackgroundProcessorPipeline';

export interface GaussianBlurBackgroundProcessorPipelineOptions extends BackgroundProcessorPipelineOptions {
  blurFilterRadius: number;
}

export class GaussianBlurBackgroundProcessorPipeline extends BackgroundProcessorPipeline {
  private _blurFilterRadius: number;
  private _gaussianBlurFilterPipeline: GaussianBlurFilterPipeline | null;

  constructor(options: GaussianBlurBackgroundProcessorPipelineOptions) {
    super(options);

    const {
      blurFilterRadius
    } = options;

    this._blurFilterRadius = blurFilterRadius;
    this._gaussianBlurFilterPipeline = null;
  }

  async setBlurFilterRadius(radius: number): Promise<void> {
    this._blurFilterRadius = radius;
  }

  protected _setBackground(
    inputFrame: InputFrame,
    webgl2Canvas: OffscreenCanvas
  ): void {
    const {
      _outputCanvas,
      _blurFilterRadius
    } = this;

    const ctx = _outputCanvas.getContext('2d')!;
    if (isCanvasBlurSupported) {
      ctx.filter = `blur(${_blurFilterRadius}px)`;
      ctx.drawImage(
        inputFrame,
        0,
        0
      );
      return;
    }
    if (!this._gaussianBlurFilterPipeline) {
      this._gaussianBlurFilterPipeline = new GaussianBlurFilterPipeline(
        webgl2Canvas
      );
      this._gaussianBlurFilterPipeline.updateRadius(
        _blurFilterRadius
      );
    }
    this._gaussianBlurFilterPipeline!.render();
    ctx.drawImage(
      webgl2Canvas,
      0,
      0
    );
  }
}

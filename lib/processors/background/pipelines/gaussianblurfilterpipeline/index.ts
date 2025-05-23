import { WebGL2Pipeline } from '../../../pipelines';
import { SinglePassGaussianBlurFilterStage } from './SinglePassGaussianBlurFilterStage';

/**
 * @private
 */
export class GaussianBlurFilterPipeline extends WebGL2Pipeline {
  private _isWebGL2Supported: boolean = true;
  private _outputCanvas: OffscreenCanvas | HTMLCanvasElement;
  private _blurFilterRadius: number;

  constructor(outputCanvas: OffscreenCanvas | HTMLCanvasElement, blurFilterRadius: number) {
    super();

    this._outputCanvas = outputCanvas;
    this._blurFilterRadius = blurFilterRadius;
    const glOut = outputCanvas.getContext('webgl2');
    if (glOut) {
      this.initializeWebGL2Pipeline(glOut as WebGL2RenderingContext);
    } else {
      this._isWebGL2Supported = false;
      console.warn('Downgraded to Canvas2D for Gaussian blur due to missing WebGL2 support.');
    }
  }

  render(): void {
    if (!this._isWebGL2Supported) {
      this._renderFallback();
    } else {
      super.render();
    }
  }

  private _renderFallback(): void {
    const ctx = this._outputCanvas.getContext('2d') as CanvasRenderingContext2D;
    ctx.filter = `blur(${this._blurFilterRadius}px)`;
  }

  private initializeWebGL2Pipeline(glOut: WebGL2RenderingContext): void {
    this.addStage(new SinglePassGaussianBlurFilterStage(
      glOut,
      'horizontal',
      'texture',
      0,
      2
    ));

    this.addStage(new SinglePassGaussianBlurFilterStage(
      glOut,
      'vertical',
      'canvas',
      2
    ));
  }

  updateRadius(radius: number): void {
    this._blurFilterRadius = radius;
    if (!this._isWebGL2Supported) {
      // SinglePassGaussianBlurFilterStage is not supported in Canvas2D fallback
      return;
    }
    this._stages.forEach(
      (stage) => (stage as SinglePassGaussianBlurFilterStage)
        .updateRadius(radius)
    );
  }

  cleanUp(): void {
    if(this._isWebGL2Supported) {
      super.cleanUp();
    }
  }
}

import { WebGL2Pipeline } from '../../../pipelines';
import { SinglePassGaussianBlurFilterStage } from './SinglePassGaussianBlurFilterStage';

/**
 * @private
 */
export class GaussianBlurFilterPipeline extends WebGL2Pipeline {
  constructor(outputCanvas: OffscreenCanvas | HTMLCanvasElement) {
    super();

    const glOut = outputCanvas.getContext('webgl2')! as WebGL2RenderingContext;

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
    this._stages.forEach(
      (stage) => (stage as SinglePassGaussianBlurFilterStage)
        .updateRadius(radius)
    );
  }
}

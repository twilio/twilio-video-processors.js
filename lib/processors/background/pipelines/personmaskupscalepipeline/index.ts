import { BilateralFilterConfig, Dimensions, InputFrame } from '../../../../types';
import { WebGL2Pipeline } from '../../../pipelines';
import { SinglePassBilateralFilterStage } from './SinglePassBilateralFilterStage';

/**
 * @private
 */
export class PersonMaskUpscalePipeline extends WebGL2Pipeline {
  private readonly _outputCanvas: OffscreenCanvas | HTMLCanvasElement;
  private readonly _inputDimensions: Dimensions;
  private _isWebGL2Supported: boolean = true;
  
  constructor(
    inputDimensions: Dimensions,
    outputCanvas: OffscreenCanvas | HTMLCanvasElement
  ) {
    super();
    
    this._outputCanvas = outputCanvas;
    this._inputDimensions = inputDimensions;

      const glOut = outputCanvas.getContext('webgl2');
      if (glOut) {
        this.initializeWebGL2Pipeline(glOut as WebGL2RenderingContext);
      } else {
        this._isWebGL2Supported = false;
        console.warn('Downgraded to Canvas2D for person mask upscaling due to missing WebGL2 support.');
      }
  }

  private initializeWebGL2Pipeline(glOut: WebGL2RenderingContext): void {
    const outputDimensions = {
      height: this._outputCanvas.height,
      width: this._outputCanvas.width
    };

    this.addStage(new WebGL2Pipeline.InputStage(glOut));

    this.addStage(new SinglePassBilateralFilterStage(
      glOut,
      'horizontal',
      'texture',
      this._inputDimensions,
      outputDimensions,
      1,
      2
    ));

    this.addStage(new SinglePassBilateralFilterStage(
      glOut,
      'vertical',
      'canvas',
      this._inputDimensions,
      outputDimensions,
      2
    ));
  }

  render(
    inputFrame: InputFrame,
    personMask: ImageData
  ): void {
    if (this._isWebGL2Supported) {
      // Use WebGL2 pipeline when supported
      super.render(inputFrame, personMask);
    } else {
      // Fallback for browsers without WebGL2 support
      this._renderFallback(inputFrame, personMask);
    }
  }
  
  /**
   * Render the person mask using a Canvas 2D context as a fallback for browsers without WebGL2 support
   * @param inputFrame - The input frame to render
   * @param personMask - The person mask to render
   */
  private _renderFallback(
    inputFrame: InputFrame,
    personMask: ImageData
  ): void {
    // Create a temporary canvas for the mask
    const maskCanvas = new OffscreenCanvas(personMask.width, personMask.height);
    const maskCtx = maskCanvas.getContext('2d')!;
    maskCtx.putImageData(personMask, 0, 0);

    // Get 2D context for drawing
    const ctx = this._outputCanvas.getContext('2d') as CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D;
    ctx.save();
    ctx.filter = 'blur(4px)'; // Default blur value from v2.x
    ctx.globalCompositeOperation = 'copy';
    ctx.drawImage(maskCanvas, 0, 0, this._outputCanvas.width, this._outputCanvas.height);
    ctx.filter = 'none';
    ctx.globalCompositeOperation = 'source-in';
    ctx.drawImage(inputFrame, 0, 0, this._outputCanvas.width, this._outputCanvas.height);
    ctx.restore();
  }

  updateBilateralFilterConfig(config: BilateralFilterConfig) {
    if (!this._isWebGL2Supported) {
      // SigmaSpace is not supported in Canvas2D fallback
      return;
    }
    const [
      /* inputStage */,
      ...bilateralFilterStages
    ] = this._stages;
    const { sigmaSpace } = config;

    if (typeof sigmaSpace === 'number') {
      (bilateralFilterStages as SinglePassBilateralFilterStage[]).forEach(
        (stage) => {
          stage.updateSigmaColor(0.1);
          stage.updateSigmaSpace(sigmaSpace);
        }
      );
    }
  }

  cleanUp(): void {
    if(this._isWebGL2Supported) {
      super.cleanUp();
    }
  }
}

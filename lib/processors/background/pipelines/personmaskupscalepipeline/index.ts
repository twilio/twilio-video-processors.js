import { BilateralFilterConfig, Dimensions, InputFrame } from '../../../../types';
import { WebGL2Pipeline } from '../../../pipelines';
import { SinglePassBilateralFilterStage } from './SinglePassBilateralFilterStage';

/**
 * @private
 */
export class PersonMaskUpscalePipeline extends WebGL2Pipeline {
  private _outputCanvas: OffscreenCanvas | HTMLCanvasElement;
  private readonly _inputDimensions: Dimensions;
  private _isWebGL2Supported: boolean = true;
  private _maskBlurRadius: number;
  
  constructor(
    inputDimensions: Dimensions,
    outputCanvas: OffscreenCanvas | HTMLCanvasElement,
    maskBlurRadius: number
  ) {
    super();
    
    this._outputCanvas = outputCanvas;
    this._inputDimensions = inputDimensions;
    this._maskBlurRadius = maskBlurRadius;

      const glOut = outputCanvas.getContext('webgl2');
      if (glOut) {
        try {
          this.initializeWebGL2Pipeline(glOut as WebGL2RenderingContext);
        } catch (error) {
          // Release the stages built before the failure.
          this.cleanUp();
          this._isWebGL2Supported = false;
          // The WebGL2 context owns outputCanvas, so getContext('2d') on it returns null.
          this._outputCanvas = new OffscreenCanvas(outputCanvas.width, outputCanvas.height);
          console.warn('Downgraded to Canvas2D for person mask upscaling due to WebGL2 pipeline failure.', error);
        }
      } else {
        this._isWebGL2Supported = false;
        console.warn('Downgraded to Canvas2D for person mask upscaling due to missing WebGL2 support.');
      }
  }

  /**
   * The canvas holding the upscaled person mask after render(). This is the
   * constructor's outputCanvas unless the WebGL2 pipeline failed to build.
   */
  get outputCanvas(): OffscreenCanvas | HTMLCanvasElement {
    return this._outputCanvas;
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
    ctx.filter = `blur(${this._maskBlurRadius}px)`;
    ctx.globalCompositeOperation = 'copy';
    ctx.drawImage(maskCanvas, 0, 0, this._outputCanvas.width, this._outputCanvas.height);
    ctx.filter = 'none';
    ctx.globalCompositeOperation = 'source-in';
    ctx.drawImage(inputFrame, 0, 0, this._outputCanvas.width, this._outputCanvas.height);
    ctx.restore();
  }

  updateBilateralFilterConfig(config: BilateralFilterConfig) {
    const { sigmaSpace } = config;
    if (typeof sigmaSpace !== 'number') {
      return;
    }
    if (!this._isWebGL2Supported) {
      this._maskBlurRadius = sigmaSpace;
      // SinglePassBilateralFilterStage is not supported in Canvas2D fallback
      return;
    }
    const [
      /* inputStage */,
      ...bilateralFilterStages
    ] = this._stages;

    (bilateralFilterStages as SinglePassBilateralFilterStage[]).forEach(
      (stage) => {
        stage.updateSigmaColor(0.1);
        stage.updateSigmaSpace(sigmaSpace);
      }
    );
  }

  cleanUp(): void {
    if(this._isWebGL2Supported) {
      super.cleanUp();
    }
  }
}

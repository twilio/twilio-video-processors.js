import { Processor } from '../Processor';

/**
 * @private
 * The [[GrayscaleProcessor]] is a [[Processor]] which applies
 * a grayscale transform to a frame.
 */
export class GrayscaleProcessor extends Processor {

  private _outputFrame: OffscreenCanvas;

  constructor() {
    super();
    this._outputFrame = new OffscreenCanvas(1, 1);
  }

  /**
   * Applies a grayscale transform to the input frame and generate an output frame.
   * @param inputFrame - The input frame to process.
   * @returns The outputframe or null if the transform cannot be applied.
   */
  processFrame(inputFrame: OffscreenCanvas): OffscreenCanvas | null {
    this._outputFrame.width = inputFrame.width;
    this._outputFrame.height = inputFrame.height;

    const context = this._outputFrame.getContext('2d');
    if (context) {
      context.filter = 'grayscale(100%)';
      context.drawImage(inputFrame, 0, 0, inputFrame.width, inputFrame.height);
      return this._outputFrame;
    }
    return null;
  }
}

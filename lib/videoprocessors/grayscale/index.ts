import { VideoProcessor } from '../VideoProcessor';

/**
 * The [[GrayscaleVideoProcessor]] is a [[VideoProcessor]] which applies
 * a grayscale transform to a video frame.
 */
export class GrayscaleVideoProcessor extends VideoProcessor {

  private _outputFrame: OffscreenCanvas;

  constructor() {
    super();
    this._outputFrame = new OffscreenCanvas(1, 1);
  }

  /**
   * Applies a grayscale transform to the input video frame and generate an output video frame.
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

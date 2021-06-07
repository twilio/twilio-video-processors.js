import { Processor } from '../Processor';

/**
 * @private
 * The [[GrayscaleProcessor]] is a [[Processor]] which applies
 * a grayscale transform to a frame.
 */
export class GrayscaleProcessor extends Processor {

  /**
   * Applies a grayscale transform to the input frame and draw the results to an output frame.
   * @param inputFrameBuffer - The source of the input frame to process.
   * @param outputFrameBuffer - The output frame buffer to use to draw the processed frame.
   */
  processFrame(inputFrameBuffer: OffscreenCanvas, outputFrameBuffer: HTMLCanvasElement): void {
    const context = outputFrameBuffer.getContext('2d');
    if (context) {
      context.filter = 'grayscale(100%)';
      context.drawImage(inputFrameBuffer, 0, 0, inputFrameBuffer.width, inputFrameBuffer.height);
    }
  }
}

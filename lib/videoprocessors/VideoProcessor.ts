/**
 * The [[VideoProcessor]] is an abstract class for building your own custom video processors.
 */
export abstract class VideoProcessor {

  /**
   * Applies a transform to the input video frame and generate an output video frame.
   * The frame will be dropped if this method returns null or raises and exception.
   * @param inputFrame - The input frame to process.
   */
  abstract processFrame(inputFrame: OffscreenCanvas)
    : Promise<OffscreenCanvas | null>
    | OffscreenCanvas | null;
}

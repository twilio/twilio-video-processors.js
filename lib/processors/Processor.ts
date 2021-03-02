/**
 * The [[Processor]] is an abstract class for building your own custom processors.
 */
export abstract class Processor {

  /**
   * Applies a transform to the input frame and generate an output frame.
   * The frame will be dropped if this method returns null or raises and exception.
   * @param inputFrame - The input frame to process.
   */
  abstract processFrame(inputFrame: OffscreenCanvas)
    : Promise<OffscreenCanvas | null>
    | OffscreenCanvas | null;
}

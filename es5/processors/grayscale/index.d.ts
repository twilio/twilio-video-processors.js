import { Processor } from '../Processor';
/**
 * @private
 * The [[GrayscaleProcessor]] is a [[Processor]] which applies
 * a grayscale transform to a frame.
 */
export declare class GrayscaleProcessor extends Processor {
    private _outputFrame;
    constructor();
    /**
     * Applies a grayscale transform to the input frame and generate an output frame.
     * @param inputFrame - The input frame to process.
     * @returns The outputframe or null if the transform cannot be applied.
     */
    processFrame(inputFrame: OffscreenCanvas): OffscreenCanvas | null;
}

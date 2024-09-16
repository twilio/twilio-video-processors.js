import { InputFrame } from '../../../../types';
import { Pipeline } from '../../../pipelines';
/**
 * @private
 */
export interface BackgroundProcessorPipelineOptions {
    assetsPath: string;
    deferInputFrameDownscale: boolean;
    maskBlurRadius: number;
}
/**
 * @private
 */
export declare abstract class BackgroundProcessorPipeline extends Pipeline {
    private static _twilioTFLite;
    protected readonly _outputCanvas: OffscreenCanvas;
    protected readonly _webgl2Canvas: OffscreenCanvas;
    private readonly _assetsPath;
    private readonly _benchmark;
    private _deferInputFrameDownscale;
    private readonly _inferenceInputCanvas;
    private readonly _inputFrameDownscaleMode;
    private readonly _onResizeWebGL2Canvas;
    protected constructor(options: BackgroundProcessorPipelineOptions, onResizeWebGL2Canvas?: () => void);
    loadTwilioTFLite(): Promise<boolean>;
    render(inputFrame: InputFrame): Promise<OffscreenCanvas | ImageBitmap | null>;
    setDeferInputFrameDownscale(defer: boolean): Promise<void>;
    setMaskBlurRadius(radius: number): Promise<void>;
    protected abstract _setBackground(inputFrame?: InputFrame): void;
}

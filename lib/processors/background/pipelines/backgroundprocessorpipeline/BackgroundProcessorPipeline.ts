import { MODEL_NAME, TFLITE_LOADER_NAME, TFLITE_SIMD_LOADER_NAME, WASM_INFERENCE_DIMENSIONS } from '../../../../constants';
import { Benchmark } from '../../../../utils/Benchmark';
import { isChromiumImageBitmap } from '../../../../utils/support';
import { TwilioTFLite } from '../../../../utils/TwilioTFLite';
import { InputFrame } from '../../../../types';
import { Pipeline } from '../../../pipelines';
import { InputFrameDowscaleStage } from './InputFrameDownscaleStage';
import { PostProcessingStage } from './PostProcessingStage';

export interface BackgroundProcessorPipelineOptions {
  assetsPath: string;
  maskBlurRadius: number;
}

/**
 * @private
 */
export abstract class BackgroundProcessorPipeline extends Pipeline {
  private static _twilioTFLite: TwilioTFLite | null = null;

  protected readonly _outputCanvas = new OffscreenCanvas(1, 1);
  private readonly _assetsPath: string;
  private readonly _benchmark = new Benchmark();
  private readonly _deferInputFrameDownscale = false;
  private readonly _inferenceInputCanvas = new OffscreenCanvas(WASM_INFERENCE_DIMENSIONS.width, WASM_INFERENCE_DIMENSIONS.height);
  private readonly _inputFrameDownscaleMode = isChromiumImageBitmap() ? 'image-bitmap' : 'canvas';
  private readonly _webgl2Canvas = new OffscreenCanvas(1, 1);

  protected constructor(
    options: BackgroundProcessorPipelineOptions
  ) {
    super();

    const {
      assetsPath,
      maskBlurRadius
    } = options;

    this._assetsPath = assetsPath;

    this.addStage(new InputFrameDowscaleStage(
      this._inferenceInputCanvas,
      this._inputFrameDownscaleMode
    ));

    this.addStage(new PostProcessingStage(
      WASM_INFERENCE_DIMENSIONS,
      this._webgl2Canvas,
      this._outputCanvas,
      maskBlurRadius,
      (inputFrame?: InputFrame, webgl2Canvas?: OffscreenCanvas): void =>
        this._setBackground(inputFrame, webgl2Canvas)
    ));
  }

  async loadTwilioTFLite(): Promise<boolean> {
    let { _twilioTFLite } = BackgroundProcessorPipeline;
    if (!_twilioTFLite) {
      _twilioTFLite = new TwilioTFLite();
      await _twilioTFLite.initialize(
        this._assetsPath,
        MODEL_NAME,
        TFLITE_LOADER_NAME,
        TFLITE_SIMD_LOADER_NAME
      );
      BackgroundProcessorPipeline._twilioTFLite = _twilioTFLite;
    }
    return _twilioTFLite.isSimdEnabled!;
  }

  async render(inputFrame: InputFrame): Promise<OffscreenCanvas | ImageBitmap | null> {
    if (!BackgroundProcessorPipeline._twilioTFLite) {
      return null;
    }

    const [
      inputFrameDownscaleStage,
      postProcessingStage
    ] = this._stages as [
      InputFrameDowscaleStage,
      PostProcessingStage
    ];

    const {
      _benchmark,
      _deferInputFrameDownscale,
      _inferenceInputCanvas: {
        height: inferenceInputHeight,
        width: inferenceInputWidth
      },
      _outputCanvas,
      _webgl2Canvas
    } = this;

    const {
      _twilioTFLite
    } = BackgroundProcessorPipeline;

    const isInputVideoFrame = typeof VideoFrame === 'function'
      && inputFrame instanceof VideoFrame;

    const { height, width } = isInputVideoFrame
      ? { height: inputFrame.displayHeight, width: inputFrame.displayWidth }
      : inputFrame as (OffscreenCanvas | HTMLCanvasElement);

    if (_outputCanvas.width !== width) {
      _outputCanvas.width = width;
      _webgl2Canvas.width = width;
    }
    if (_outputCanvas.height !== height) {
      _outputCanvas.height = height;
      _webgl2Canvas.height = height;
    }

    _benchmark.start('inputImageResizeDelay');
    const downscalePromise = inputFrameDownscaleStage.render(inputFrame)
      .then((downscaledFrameData) => {
        _twilioTFLite!.loadInputBuffer(downscaledFrameData);
      });

    if (!_deferInputFrameDownscale) {
      await downscalePromise;
    }
    _benchmark.end('inputImageResizeDelay');

    _benchmark.start('segmentationDelay');
    const personMask = new ImageData(
      _twilioTFLite!.runInference(),
      inferenceInputWidth,
      inferenceInputHeight
    );
    _benchmark.end('segmentationDelay');

    _benchmark.start('imageCompositionDelay');
    postProcessingStage.render(
      inputFrame,
      personMask
    );
    _benchmark.end('imageCompositionDelay');

    if (typeof VideoFrame === 'function'
      && inputFrame instanceof VideoFrame) {
      inputFrame.close();
    }

    return this._outputCanvas;
  }

  async setMaskBlurRadius(radius: number): Promise<void> {
    (this._stages[1] as PostProcessingStage)
      .updateMaskBlurRadius(radius);
  }

  protected abstract _setBackground(
    inputFrame?: InputFrame,
    webgl2Canvas?: OffscreenCanvas
  ): void;
}

import { MODEL_NAME, TFLITE_LOADER_NAME, TFLITE_SIMD_LOADER_NAME, WASM_INFERENCE_DIMENSIONS } from '../../../../constants';
import { Benchmark } from '../../../../utils/Benchmark';
import { isChromiumImageBitmap } from '../../../../utils/support';
import { TwilioTFLite } from '../../../../utils/TwilioTFLite';
import { InputFrame } from '../../../../types';
import { Pipeline } from '../../../pipelines';
import { InputFrameDowscaleStage } from './InputFrameDownscaleStage';
import { PostProcessingStage } from './PostProcessingStage';

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
export abstract class BackgroundProcessorPipeline extends Pipeline {
  private static _twilioTFLite: TwilioTFLite | null = null;

  protected readonly _outputCanvas = new OffscreenCanvas(1, 1);
  protected readonly _webgl2Canvas = new OffscreenCanvas(1, 1);
  private readonly _assetsPath: string;
  private readonly _benchmark = new Benchmark();
  private _deferInputFrameDownscale: boolean;
  private readonly _inferenceInputCanvas = new OffscreenCanvas(WASM_INFERENCE_DIMENSIONS.width, WASM_INFERENCE_DIMENSIONS.height);
  private readonly _inputFrameDownscaleMode = isChromiumImageBitmap() ? 'image-bitmap' : 'canvas';
  private readonly _onResizeWebGL2Canvas: () => void;

  protected constructor(
    options: BackgroundProcessorPipelineOptions,
    onResizeWebGL2Canvas = () => {}
  ) {
    super();

    const {
      assetsPath,
      deferInputFrameDownscale,
      maskBlurRadius
    } = options;

    this._assetsPath = assetsPath;
    this._deferInputFrameDownscale = deferInputFrameDownscale;
    this._onResizeWebGL2Canvas = onResizeWebGL2Canvas;

    this.addStage(new InputFrameDowscaleStage(
      this._inferenceInputCanvas,
      this._inputFrameDownscaleMode
    ));

    this.addStage(new PostProcessingStage(
      WASM_INFERENCE_DIMENSIONS,
      this._webgl2Canvas,
      this._outputCanvas,
      maskBlurRadius,
      (inputFrame?: InputFrame): void => this._setBackground(inputFrame)
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
      : inputFrame as (OffscreenCanvas | HTMLCanvasElement | ImageBitmap);

    let didResizeWebGL2Canvas = false;
    if (_outputCanvas.width !== width) {
      _outputCanvas.width = width;
      _webgl2Canvas.width = width;
      didResizeWebGL2Canvas = true;
    }
    if (_outputCanvas.height !== height) {
      _outputCanvas.height = height;
      _webgl2Canvas.height = height;
      didResizeWebGL2Canvas = true;
    }
    if (didResizeWebGL2Canvas) {
      postProcessingStage.resetPersonMaskUpscalePipeline();
      this._onResizeWebGL2Canvas();
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

    if ((typeof VideoFrame === 'function' && inputFrame instanceof VideoFrame)
      || (typeof ImageBitmap === 'function' && inputFrame instanceof ImageBitmap)) {
      inputFrame.close();
    }

    return this._outputCanvas;
  }

  async setDeferInputFrameDownscale(defer: boolean): Promise<void> {
    this._deferInputFrameDownscale = defer;
  }

  async setMaskBlurRadius(radius: number): Promise<void> {
    (this._stages[1] as PostProcessingStage)
      .updateMaskBlurRadius(radius);
  }

  protected abstract _setBackground(inputFrame?: InputFrame): void;
}

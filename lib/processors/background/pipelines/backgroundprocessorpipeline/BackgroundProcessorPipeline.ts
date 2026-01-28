import { DEFAULT_MODEL_TYPE, MODEL_CONFIGS, ModelType, TFLITE_LOADER_NAME, TFLITE_SIMD_LOADER_NAME } from '../../../../constants';
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
  hysteresisEnabled?: boolean;
  hysteresisHigh?: number;
  hysteresisLow?: number;
  maskBlurRadius: number;
  modelType?: ModelType;
  sigmaColor?: number;
  skipPostProcessing?: boolean;
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
  private _currentModelType: ModelType;
  private _deferInputFrameDownscale: boolean;
  private _inferenceInputCanvas: OffscreenCanvas;
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
      hysteresisEnabled,
      hysteresisHigh,
      hysteresisLow,
      maskBlurRadius,
      modelType = DEFAULT_MODEL_TYPE,
      sigmaColor,
      skipPostProcessing
    } = options;

    this._assetsPath = assetsPath;
    this._currentModelType = modelType;
    this._deferInputFrameDownscale = deferInputFrameDownscale;
    this._onResizeWebGL2Canvas = onResizeWebGL2Canvas;

    const modelConfig = MODEL_CONFIGS[modelType];
    this._inferenceInputCanvas = new OffscreenCanvas(
      modelConfig.dimensions.width,
      modelConfig.dimensions.height
    );

    this.addStage(new InputFrameDowscaleStage(
      this._inferenceInputCanvas,
      this._inputFrameDownscaleMode
    ));

    this.addStage(new PostProcessingStage(
      modelConfig.dimensions,
      this._webgl2Canvas,
      this._outputCanvas,
      maskBlurRadius,
      (inputFrame?: InputFrame): void => this._setBackground(inputFrame),
      {
        hysteresisEnabled,
        hysteresisHigh,
        hysteresisLow,
        sigmaColor,
        skipPostProcessing
      }
    ));
  }

  async loadTwilioTFLite(): Promise<boolean> {
    let { _twilioTFLite } = BackgroundProcessorPipeline;
    if (!_twilioTFLite) {
      _twilioTFLite = new TwilioTFLite();
      const modelConfig = MODEL_CONFIGS[this._currentModelType];
      await _twilioTFLite.initialize(
        this._assetsPath,
        modelConfig.name,
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

    // Check if canvas dimensions need to be updated
    const needsWidthResize = _outputCanvas.width !== width;
    const needsHeightResize = _outputCanvas.height !== height;
    const didResizeWebGL2Canvas = needsWidthResize || needsHeightResize;
    
    if (needsWidthResize) {
      _outputCanvas.width = width;
      _webgl2Canvas.width = width;
    }
    
    if (needsHeightResize) {
      _outputCanvas.height = height;
      _webgl2Canvas.height = height;
    }
    if (didResizeWebGL2Canvas) {
      postProcessingStage.resetPersonMaskUpscalePipeline();
      this._onResizeWebGL2Canvas();
    }

    _benchmark.start('inputImageResizeDelay');

    // Downscale the input frame and load the downscaled frame data into the TFLite model
    const downscalePromise = inputFrameDownscaleStage.render(inputFrame)
      .then((downscaledFrameData) => {
        _twilioTFLite.loadInputBuffer(downscaledFrameData);
      });

    if (!_deferInputFrameDownscale) {
      await downscalePromise;
    }
    _benchmark.end('inputImageResizeDelay');

    _benchmark.start('segmentationDelay');
    const personMask = new ImageData(
      _twilioTFLite.runInference(),
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

  async setModelType(modelType: ModelType): Promise<void> {
    if (this._currentModelType === modelType) {
      return;
    }
    const { _twilioTFLite } = BackgroundProcessorPipeline;
    if (!_twilioTFLite) {
      this._currentModelType = modelType;
      return;
    }

    const modelConfig = MODEL_CONFIGS[modelType];
    await _twilioTFLite.switchModel(this._assetsPath, modelConfig.name);

    this._inferenceInputCanvas.width = modelConfig.dimensions.width;
    this._inferenceInputCanvas.height = modelConfig.dimensions.height;

    (this._stages[1] as PostProcessingStage)
      .updateInputDimensions(modelConfig.dimensions);

    this._currentModelType = modelType;
  }

  async setHysteresisEnabled(enabled: boolean): Promise<void> {
    (this._stages[1] as PostProcessingStage)
      .updateHysteresisEnabled(enabled);
  }

  async setHysteresisHigh(high: number): Promise<void> {
    (this._stages[1] as PostProcessingStage)
      .updateHysteresisHigh(high);
  }

  async setHysteresisLow(low: number): Promise<void> {
    (this._stages[1] as PostProcessingStage)
      .updateHysteresisLow(low);
  }

  async setMaskBlurRadius(radius: number): Promise<void> {
    (this._stages[1] as PostProcessingStage)
      .updateMaskBlurRadius(radius);
  }

  async setSigmaColor(sigmaColor: number): Promise<void> {
    (this._stages[1] as PostProcessingStage)
      .updateSigmaColor(sigmaColor);
  }

  async setSkipPostProcessing(skip: boolean): Promise<void> {
    (this._stages[1] as PostProcessingStage)
      .updateSkipPostProcessing(skip);
  }

  protected abstract _setBackground(inputFrame?: InputFrame): void;
}

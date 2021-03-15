import '@tensorflow/tfjs-backend-webgl';
import '@tensorflow/tfjs-backend-cpu';
import { ModelConfig, PersonInferenceConfig } from '@tensorflow-models/body-pix/dist/body_pix_model';
import { BodyPix, load as loadModel, SemanticPersonSegmentation } from '@tensorflow-models/body-pix';
import { INFERENCE_CONFIG, MASK_BLUR_RADIUS, MODEL_CONFIG, INFERENCE_RESOLUTION } from '../../constants';
import { Processor } from '../Processor';
import { Benchmark } from '../../utils/Benchmark';
import { Resolution } from '../../types';

/**
 * @private
 */
export interface BackgroundProcessorOptions {
  /**
   * @private
   */
  inferenceConfig?: PersonInferenceConfig;

  /**
   * The input frame will be downscaled to this resolution before sending it for inference.
   * @default
   * ```html
   * 224x224
   * ```
   */
  inferenceResolution?: Resolution;

  /**
   * The blur radius to use when smoothing out the edges of the person's mask.
   * @default
   * ```html
   * 3
   * ```
   */
  maskBlurRadius?: number;
}

/**
 * @private
 */
export abstract class BackgroundProcessor extends Processor {
  private static _model: BodyPix | null = null;
  private static async _loadModel(config: ModelConfig = MODEL_CONFIG): Promise<void> {
    BackgroundProcessor._model = await loadModel(config)
      .catch((error: any) => console.error('Unable to load model.', error)) || null;
  }
  protected _outputCanvas: OffscreenCanvas;
  protected _outputContext: OffscreenCanvasRenderingContext2D;

  private _benchmark: Benchmark;
  private _inferenceConfig: PersonInferenceConfig = INFERENCE_CONFIG;
  private _inferenceResolution: Resolution = INFERENCE_RESOLUTION;
  private _inputCanvas: HTMLCanvasElement;
  private _inputContext: CanvasRenderingContext2D;
  private _maskBlurRadius: number = MASK_BLUR_RADIUS;
  private _maskCanvas: OffscreenCanvas;
  private _maskContext: OffscreenCanvasRenderingContext2D;

  constructor(options?: BackgroundProcessorOptions) {
    super();
    this.inferenceConfig = options?.inferenceConfig!;
    this.inferenceResolution = options?.inferenceResolution!;
    this.maskBlurRadius = options?.maskBlurRadius!;

    this._benchmark = new Benchmark();
    this._inputCanvas = document.createElement('canvas');
    this._inputContext = this._inputCanvas.getContext('2d') as CanvasRenderingContext2D;
    this._maskCanvas = new OffscreenCanvas(1, 1);
    this._maskContext = this._maskCanvas.getContext('2d') as OffscreenCanvasRenderingContext2D;
    this._outputCanvas = new OffscreenCanvas(1, 1);
    this._outputContext = this._outputCanvas.getContext('2d') as OffscreenCanvasRenderingContext2D;

    BackgroundProcessor._loadModel();
  }

  /**
   * @private
   */
  get benchmark(): Benchmark {
    return this._benchmark;
  }

  /**
   * @private
   */
  get inferenceConfig(): PersonInferenceConfig {
    return this._inferenceConfig;
  }

  set inferenceConfig(config: PersonInferenceConfig) {
    if (!config || !Object.keys(config).length) {
      console.warn('Inference config not found. Using defaults.');
      config = INFERENCE_CONFIG;
    }
    this._inferenceConfig = config;
  }

  /**
   * The input frame will be downscaled to this resolution before sending it for inference.
   */
  get inferenceResolution(): Resolution {
    return this._inferenceResolution;
  }

  set inferenceResolution(resolution: Resolution) {
    if (!resolution || !resolution.height || !resolution.width) {
      console.warn('Valid inference resolution not found. Using defaults');
      resolution = INFERENCE_RESOLUTION;
    }
    this._inferenceResolution = resolution;
  }

  /**
   * The current blur radius when smoothing out the edges of the person's mask.
   */
  get maskBlurRadius(): number {
    return this._maskBlurRadius;
  }

  set maskBlurRadius(radius: number) {
    if (!radius) {
      console.warn(`Valid mask blur radius not found. Using ${MASK_BLUR_RADIUS} as default.`);
      radius = MASK_BLUR_RADIUS;
    }
    this._maskBlurRadius = radius;
  }

  /**
   * Apply a transform to the background of an input video frame
   * and leaving the foreground (person(s)) untouched. Any exception detected will return a null value
   * and will result in the frame being dropped.
   */
  async processFrame(inputFrame: OffscreenCanvas): Promise<OffscreenCanvas | null> {
    if (!BackgroundProcessor._model) {
      return inputFrame;
    }

    this._benchmark.end('processFrame(jsdk)');
    this._benchmark.start('processFrame(processor)');

    this._benchmark.start('resizeInputImage');
    const { width: captureWidth, height: captureHeight } = inputFrame;
    const { width: inferenceWidth, height: inferenceHeight } = this._inferenceResolution;
    this._inputCanvas.width = inferenceWidth;
    this._inputCanvas.height = inferenceHeight;
    this._maskCanvas.width = inferenceWidth;
    this._maskCanvas.height = inferenceHeight;
    this._outputCanvas.width = captureWidth;
    this._outputCanvas.height = captureHeight;
    this._inputContext.drawImage(inputFrame, 0, 0, inferenceWidth, inferenceHeight);
    const imageData = this._inputContext.getImageData(0, 0, inferenceWidth, inferenceHeight);
    this._benchmark.end('resizeInputImage');

    this._benchmark.start('segmentPerson');
    const segment = await BackgroundProcessor._model.segmentPerson(imageData, this._inferenceConfig);
    this._benchmark.end('segmentPerson');

    this._benchmark.start('imageCompositing');
    this._maskContext.putImageData(this._createPersonMask(segment), 0, 0);
    this._outputContext.save();
    this._outputContext.filter = `blur(${this._maskBlurRadius}px)`;
    this._outputContext.globalCompositeOperation = 'copy';
    this._outputContext.drawImage(this._maskCanvas, 0, 0, captureWidth, captureHeight);
    this._outputContext.filter = 'none';
    this._outputContext.globalCompositeOperation = 'source-in';
    this._outputContext.drawImage(inputFrame, 0, 0, captureWidth, captureHeight);
    this._outputContext.globalCompositeOperation = 'destination-over';
    this._setBackground(inputFrame);
    this._outputContext.restore();

    this._benchmark.end('imageCompositing');
    this._benchmark.end('processFrame(processor)');
    this._benchmark.end('processFrame');

    // NOTE (csantos): Start the benchmark from here so we can include the delay from the Video sdk
    // for a more accurate fps
    this._benchmark.start('processFrame');
    this._benchmark.start('processFrame(jsdk)');

    return this._outputCanvas;
  }

  protected abstract _setBackground(inputFrame: OffscreenCanvas): void;

  private _createPersonMask(segment: SemanticPersonSegmentation) {
    const { data, width, height } = segment;
    const segmentMaskData = new Uint8ClampedArray(width * height * 4);
    for (let i = 0; i < data.length; i++) {
      const m = i << 2;
      segmentMaskData[m] = segmentMaskData[m + 1] = segmentMaskData[m + 2] = segmentMaskData[m + 3] =
        data[i] * 255;
    }
    return new ImageData(segmentMaskData, width, height);
  }
}

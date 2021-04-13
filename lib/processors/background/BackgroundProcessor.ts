import '@tensorflow/tfjs-backend-webgl';
import '@tensorflow/tfjs-backend-cpu';
import { ModelConfig, PersonInferenceConfig } from '@tensorflow-models/body-pix/dist/body_pix_model';
import { BodyPix, load as loadModel, SemanticPersonSegmentation } from '@tensorflow-models/body-pix';
import { Processor } from '../Processor';
import { Benchmark } from '../../utils/Benchmark';
import { Dimensions } from '../../types';

import {
  HISTORY_COUNT,
  INFERENCE_CONFIG,
  MASK_BLUR_RADIUS,
  MODEL_CONFIG,
  INFERENCE_DIMENSIONS
} from '../../constants';

/**
 * @private
 */
export interface BackgroundProcessorOptions {
  /**
   * @private
   */
  historyCount?: number;

  /**
   * @private
   */
  inferenceConfig?: PersonInferenceConfig;

  /**
   * The input frame will be downscaled to these dimensions before sending it for inference.
   * @default
   * ```html
   * 224x224
   * ```
   */
  inferenceDimensions?: Dimensions;

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
  private _historyCount: number = HISTORY_COUNT;
  private _inferenceConfig: PersonInferenceConfig = INFERENCE_CONFIG;
  private _inferenceDimensions: Dimensions = INFERENCE_DIMENSIONS;
  private _inputCanvas: HTMLCanvasElement;
  private _inputContext: CanvasRenderingContext2D;
  private _maskBlurRadius: number = MASK_BLUR_RADIUS;
  private _maskCanvas: OffscreenCanvas;
  private _maskContext: OffscreenCanvasRenderingContext2D;
  private _masks: SemanticPersonSegmentation[];

  constructor(options?: BackgroundProcessorOptions) {
    super();
    this.historyCount = options?.historyCount!;
    this.inferenceConfig = options?.inferenceConfig!;
    this.inferenceDimensions = options?.inferenceDimensions!;
    this.maskBlurRadius = options?.maskBlurRadius!;

    this._benchmark = new Benchmark();
    this._inputCanvas = document.createElement('canvas');
    this._inputContext = this._inputCanvas.getContext('2d') as CanvasRenderingContext2D;
    this._maskCanvas = new OffscreenCanvas(1, 1);
    this._maskContext = this._maskCanvas.getContext('2d') as OffscreenCanvasRenderingContext2D;
    this._outputCanvas = new OffscreenCanvas(1, 1);
    this._outputContext = this._outputCanvas.getContext('2d') as OffscreenCanvasRenderingContext2D;
    this._masks = [];

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
  get historyCount(): number {
    return this._historyCount;
  }

  /**
   * @private
   */
  set historyCount(count: number) {
    if (!count) {
      console.warn(`Valid history count not found. Using ${HISTORY_COUNT} as default.`);
      count = HISTORY_COUNT;
    }
    this._historyCount = count;
  }

  /**
   * @private
   */
  get inferenceConfig(): PersonInferenceConfig {
    return this._inferenceConfig;
  }

  /**
   * @private
   */
  set inferenceConfig(config: PersonInferenceConfig) {
    if (!config || !Object.keys(config).length) {
      console.warn('Inference config not found. Using defaults.');
      config = INFERENCE_CONFIG;
    }
    this._inferenceConfig = config;
  }

  /**
   * The current inference dimensions. The input frame will be
   * downscaled to these dimensions before sending it for inference.
   */
  get inferenceDimensions(): Dimensions {
    return this._inferenceDimensions;
  }

  /**
   * Set a new inference dimensions. The input frame will be
   * downscaled to these dimensions before sending it for inference.
   */
  set inferenceDimensions(dimensions: Dimensions) {
    if (!dimensions || !dimensions.height || !dimensions.width) {
      console.warn('Valid inference dimensions not found. Using defaults');
      dimensions = INFERENCE_DIMENSIONS;
    }
    this._inferenceDimensions = dimensions;
  }

  /**
   * The current blur radius when smoothing out the edges of the person's mask.
   */
  get maskBlurRadius(): number {
    return this._maskBlurRadius;
  }

  /**
   * Set a new blur radius to be used when smoothing out the edges of the person's mask.
   */
  set maskBlurRadius(radius: number) {
    if (!radius) {
      console.warn(`Valid mask blur radius not found. Using ${MASK_BLUR_RADIUS} as default.`);
      radius = MASK_BLUR_RADIUS;
    }
    this._maskBlurRadius = radius;
  }

  /**
   * Apply a transform to the background of an input video frame and leaving
   * the foreground (person(s)) untouched. Any exception detected will
   * return a null value and will result in the frame being dropped.
   */
  async processFrame(inputFrame: OffscreenCanvas): Promise<OffscreenCanvas | null> {
    if (!BackgroundProcessor._model) {
      return inputFrame;
    }

    this._benchmark.end('processFrame(jsdk)');
    this._benchmark.start('processFrame(processor)');

    this._benchmark.start('resizeInputImage');
    const { width: captureWidth, height: captureHeight } = inputFrame;
    const { width: inferenceWidth, height: inferenceHeight } = this._inferenceDimensions;
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

    if (this._masks.length >= this._historyCount) {
      this._masks.splice(0, this._masks.length - this._historyCount + 1);
    }
    this._masks.push(segment);

    const segmentMaskData = new Uint8ClampedArray(width * height * 4);
    const weightedSum = this._masks.reduce((sum, mask, j) => sum + (j + 1) * (j + 1), 0);

    for (let i = 0; i < data.length; i++) {
      const m = i * 4;
      const hasPixel = this._masks.some(mask => mask.data[i] === 1);
      const w = this._masks.reduce((sum, mask, j) => sum + mask.data[i] * (j + 1) * (j + 1), 0) / weightedSum;

      segmentMaskData[m] = segmentMaskData[m + 1] = segmentMaskData[m + 2] = hasPixel ? 255 : 0;
      segmentMaskData[m + 3] = Math.floor(w * 255);

    }
    return new ImageData(segmentMaskData, width, height);
  }
}

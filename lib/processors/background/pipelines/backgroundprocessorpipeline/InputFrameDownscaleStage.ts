import { InputFrame } from '../../../../types';
import { Pipeline } from '../../../pipelines';

/**
 * @private
 */
export class InputFrameDowscaleStage implements Pipeline.Stage {
  private readonly _inputFrameDownscaleMode: 'canvas' | 'image-bitmap';
  private readonly _outputContext: OffscreenCanvasRenderingContext2D;

  constructor(
    outputCanvas: OffscreenCanvas,
    inputFrameDownscaleMode: 'canvas' | 'image-bitmap'

) {
    this._inputFrameDownscaleMode = inputFrameDownscaleMode;
    this._outputContext = outputCanvas.getContext('2d', { willReadFrequently: true })!;
  }

  async render(inputFrame: InputFrame): Promise<Uint8ClampedArray> {
    const {
      _outputContext,
      _inputFrameDownscaleMode,
    } = this;

    const {
      canvas: {
        height: resizeHeight,
        width: resizeWidth
      }
    } = _outputContext;

    if (_inputFrameDownscaleMode === 'image-bitmap') {
      const downscaledBitmap = await createImageBitmap(
        inputFrame,
        {
          resizeWidth,
          resizeHeight,
          resizeQuality: 'pixelated'
        }
      );
      _outputContext.drawImage(
        downscaledBitmap,
        0,
        0
      );
      downscaledBitmap.close();
    } else {
      _outputContext.drawImage(
        inputFrame,
        0,
        0,
        resizeWidth,
        resizeHeight
      );
    }

    const { data } = _outputContext.getImageData(
      0,
      0,
      resizeWidth,
      resizeHeight
    );

    return data;
  }
}

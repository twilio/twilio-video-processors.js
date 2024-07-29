import { ImageFit } from '../../../../types';
import { BackgroundProcessorPipeline, BackgroundProcessorPipelineOptions } from './BackgroundProcessorPipeline';

namespace VirtualBackgroundProcessor {
  export interface Options extends BackgroundProcessorPipelineOptions {
    fitType: ImageFit;
  }
}

/**
 * @private
 */
export class VirtualBackgroundProcessorPipeline extends BackgroundProcessorPipeline {
  private _backgroundImage: ImageBitmap | null;
  private _fitType: ImageFit;

  constructor(options: VirtualBackgroundProcessor.Options) {
    super(options);

    const {
      fitType
    } = options;

    this._backgroundImage = null;
    this._fitType = fitType;
  }

  async setBackgroundImage(
    backgroundImage: ImageBitmap
  ): Promise<void> {
    this._backgroundImage?.close();
    this._backgroundImage = backgroundImage;
  }

  async setFitType(fitType: ImageFit): Promise<void> {
    this._fitType = fitType;
  }

  protected _setBackground(): void {
    const {
      _backgroundImage,
      _fitType,
      _outputCanvas
    } = this;

    if (!_backgroundImage) {
      return;
    }

    const ctx = _outputCanvas.getContext('2d')!;
    const imageWidth = _backgroundImage.width;
    const imageHeight = _backgroundImage.height;
    const canvasWidth = _outputCanvas.width;
    const canvasHeight = _outputCanvas.height;

    if (_fitType === ImageFit.Fill) {
      ctx.drawImage(
        _backgroundImage,
        0,
        0,
        imageWidth,
        imageHeight,
        0,
        0,
        canvasWidth,
        canvasHeight
      );
    } else if (_fitType === ImageFit.None) {
      ctx.drawImage(
        _backgroundImage,
        0,
        0,
        imageWidth,
        imageHeight
      );
    } else {
      const { x, y, w, h } = this._getFitPosition(
        imageWidth,
        imageHeight,
        canvasWidth,
        canvasHeight,
        _fitType
      );
      ctx.drawImage(
        _backgroundImage,
        0,
        0,
        imageWidth,
        imageHeight,
        x,
        y,
        w,
        h
      );
    }
  }

  private _getFitPosition(
    contentWidth: number,
    contentHeight: number,
    viewportWidth: number,
    viewportHeight: number,
    type: ImageFit
  ): {
    h: number,
    w: number,
    x: number,
    y: number
  } {

    // Calculate new content width to fit viewport width
    let factor = viewportWidth / contentWidth;
    let newContentWidth = viewportWidth;
    let newContentHeight = factor * contentHeight;

    // Scale down the resulting height and width more
    // to fit viewport height if the content still exceeds it
    if ((type === ImageFit.Contain && newContentHeight > viewportHeight)
      || (type === ImageFit.Cover && viewportHeight > newContentHeight)) {
      factor = viewportHeight / newContentHeight;
      newContentWidth = factor * newContentWidth;
      newContentHeight = viewportHeight;
    }

    // Calculate the destination top left corner to center the content
    const x = (viewportWidth - newContentWidth) / 2;
    const y = (viewportHeight - newContentHeight) / 2;

    return {
      x,
      y,
      w: newContentWidth,
      h: newContentHeight,
    };
  }
}

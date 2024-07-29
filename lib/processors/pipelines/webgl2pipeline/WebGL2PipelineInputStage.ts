import { InputFrame } from '../../../types';
import { Pipeline } from '../Pipeline';
import { createTexture } from './webgl2PipelineHelpers';

/**
 * @private
 */
export class WebGL2PipelineInputStage implements Pipeline.Stage {
  private readonly _glOut: WebGL2RenderingContext;
  private readonly _inputFrameTexture: WebGLTexture;
  private _inputTexture: WebGLTexture | null = null;

  constructor(glOut: WebGL2RenderingContext) {
    const { height, width } = glOut.canvas;
    this._glOut = glOut;
    this._inputFrameTexture = createTexture(
      glOut,
      glOut.RGBA8,
      width,
      height,
      glOut.NEAREST,
      glOut.NEAREST
    )!;
  }

  cleanUp(): void {
    const {
      _glOut,
      _inputFrameTexture,
      _inputTexture
    } = this;
    _glOut.deleteTexture(_inputFrameTexture);
    _glOut.deleteTexture(_inputTexture);
  }

  render(
    inputFrame?: InputFrame,
    inputTextureData?: ImageData
  ): void {
    const {
      _glOut,
      _inputFrameTexture
    } = this;

    const { height, width } = _glOut.canvas;
    _glOut.viewport(0, 0, width, height);
    _glOut.clearColor(0, 0, 0, 0);
    _glOut.clear(_glOut.COLOR_BUFFER_BIT);

    if (inputFrame) {
      _glOut.activeTexture(_glOut.TEXTURE0);
      _glOut.bindTexture(
        _glOut.TEXTURE_2D,
        _inputFrameTexture
      );
      _glOut.texSubImage2D(
        _glOut.TEXTURE_2D,
        0,
        0,
        0,
        width,
        height,
        _glOut.RGBA,
        _glOut.UNSIGNED_BYTE,
        inputFrame
      );
    }

    if (!inputTextureData) {
      return;
    }
    const {
      data,
      height: textureHeight,
      width: textureWidth
    } = inputTextureData;

    if (!this._inputTexture) {
      this._inputTexture = createTexture(
        _glOut,
        _glOut.RGBA8,
        textureWidth,
        textureHeight,
        _glOut.NEAREST,
        _glOut.NEAREST
      );
    }

    _glOut.viewport(0, 0, textureWidth, textureHeight);
    _glOut.activeTexture(_glOut.TEXTURE1);

    _glOut.bindTexture(
      _glOut.TEXTURE_2D,
      this._inputTexture
    );
    _glOut.texSubImage2D(
      _glOut.TEXTURE_2D,
      0,
      0,
      0,
      textureWidth,
      textureHeight,
      _glOut.RGBA,
      _glOut.UNSIGNED_BYTE,
      data
    );
  }
}

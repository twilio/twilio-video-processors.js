import { Dimensions } from '../../../types'
import {
  createPipelineStageProgram,
  createTexture,
  compileShader,
  initBuffer
} from '../helpers/webglHelper'
import { Pipeline } from './Pipeline'

interface InputConfig {
  textureName: string
  textureUnit: number
}

interface OutputConfig {
  fragmentShaderSource: string
  glOut: WebGL2RenderingContext
  height?: number
  textureUnit?: number
  type: 'canvas' | 'texture'
  uniformVars?: UniformVarInfo[]
  vertexShaderSource?: string
  width?: number
}

interface UniformVarInfo {
  name: string
  type: 'float' | 'int' | 'uint' | 'float:v'
  values: number[]
}

/**
 * @private
 */
class WebGL2PipelineInputStage implements Pipeline.Stage {
  private _glOut: WebGL2RenderingContext
  private _inputFrameTexture: WebGLTexture
  private _inputTexture: WebGLTexture | null
  private _inputTextureData: ImageData | null

  constructor(glOut: WebGL2RenderingContext) {
    const { height, width } = glOut.canvas
    this._glOut = glOut
    this._inputFrameTexture = createTexture(
      glOut,
      glOut.RGBA8,
      width,
      height,
      glOut.NEAREST,
      glOut.NEAREST
    )!
    this._inputTexture = null;
    this._inputTextureData = null;
  }

  cleanUp(): void {
    const {
      _glOut,
      _inputFrameTexture,
      _inputTexture
    } = this
    _glOut.deleteTexture(_inputFrameTexture)
    _glOut.deleteTexture(_inputTexture)
  }

  render(inputFrame?: OffscreenCanvas | HTMLCanvasElement | HTMLVideoElement | VideoFrame): void {
    const {
      _glOut,
      _inputFrameTexture,
      _inputTextureData
    } = this

    const { height, width } = _glOut.canvas;
    _glOut.viewport(0, 0, width, height)
    _glOut.clearColor(0, 0, 0, 0)
    _glOut.clear(_glOut.COLOR_BUFFER_BIT)

    if (inputFrame) {
      _glOut.activeTexture(_glOut.TEXTURE0)
      _glOut.bindTexture(
        _glOut.TEXTURE_2D,
        _inputFrameTexture
      )
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
      )
    }

    if (!_inputTextureData) {
      return
    }
    const {
      data,
      height: textureHeight,
      width: textureWidth
    } = _inputTextureData

    if (!this._inputTexture) {
      this._inputTexture = createTexture(
        _glOut,
        _glOut.RGBA8,
        textureWidth,
        textureHeight,
        _glOut.NEAREST,
        _glOut.NEAREST
      )
    }

    _glOut.viewport(0, 0, textureWidth, textureHeight)
    _glOut.activeTexture(_glOut.TEXTURE1)

    _glOut.bindTexture(
      _glOut.TEXTURE_2D,
      this._inputTexture
    )
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
    )
  }

  setInputTextureData(inputTextureData: ImageData): void {
    this._inputTextureData = inputTextureData
  }
}

/**
 * @private
 */
class WebGL2PipelineProcessingStage implements Pipeline.Stage {
  protected _outputDimensions: Dimensions
  private _fragmentShader: WebGLSampler
  private _glOut: WebGL2RenderingContext
  private _outputFramebuffer: WebGLBuffer | null = null
  private _outputTexture: WebGLTexture | null = null
  private _outputTextureUnit: number
  private _positionBuffer: WebGLBuffer
  private _program: WebGLProgram
  private _texCoordBuffer: WebGLBuffer
  private _vertexShader: WebGLShader

  constructor(
    inputConfig: InputConfig,
    outputConfig: OutputConfig
  ) {
    const {
      textureName,
      textureUnit,
    } = inputConfig

    const { glOut } = outputConfig
    this._glOut = glOut

    const {
      fragmentShaderSource,
      height = glOut.canvas.height,
      textureUnit: outputTextureUnit = textureUnit + 1,
      type: outputType,
      uniformVars = [],
      vertexShaderSource = `#version 300 es
        in vec2 a_position;
        in vec2 a_texCoord;

        out vec2 v_texCoord;

        void main() {
          gl_Position = vec4(a_position${
        outputType === 'canvas'
          ? ' * vec2(1.0, -1.0)'
          : ''
      }, 0.0, 1.0);
          v_texCoord = a_texCoord;
        }
      `,
      width = glOut.canvas.width
    } = outputConfig

    this._outputDimensions = {
      height,
      width
    }

    this._outputTextureUnit = outputTextureUnit

    this._fragmentShader = compileShader(
      glOut,
      glOut.FRAGMENT_SHADER,
      fragmentShaderSource
    )

    this._vertexShader = compileShader(
      glOut,
      glOut.VERTEX_SHADER,
      vertexShaderSource
    )

    this._positionBuffer = initBuffer(
      glOut,
      [
        -1.0, -1.0,
        1.0, -1.0,
        -1.0, 1.0,
        1.0, 1.0,
      ]
    )!

    this._texCoordBuffer = initBuffer(
      glOut,
      [
        0.0, 0.0,
        1.0, 0.0,
        0.0, 1.0,
        1.0, 1.0,
      ]
    )!

    if (outputType === 'texture') {
      this._outputTexture = createTexture(
        glOut,
        glOut.RGBA8,
        width,
        height
      )
      this._outputFramebuffer = glOut.createFramebuffer()
      glOut.bindFramebuffer(
        glOut.FRAMEBUFFER,
        this._outputFramebuffer
      )
      glOut.framebufferTexture2D(
        glOut.FRAMEBUFFER,
        glOut.COLOR_ATTACHMENT0,
        glOut.TEXTURE_2D,
        this._outputTexture,
        0
      )
    }

    const program = createPipelineStageProgram(
      glOut,
      this._vertexShader,
      this._fragmentShader,
      this._positionBuffer,
      this._texCoordBuffer
    )
    this._program = program

    this._setUniformVars([
      {
        name: textureName,
        type: 'int',
        values: [textureUnit]
      },
      ...uniformVars
    ])
  }

  cleanUp(): void {
    const {
      _fragmentShader,
      _glOut,
      _positionBuffer,
      _program,
      _texCoordBuffer,
      _vertexShader
    } = this
    _glOut.deleteProgram(_program)
    _glOut.deleteBuffer(_texCoordBuffer)
    _glOut.deleteBuffer(_positionBuffer)
    _glOut.deleteShader(_vertexShader)
    _glOut.deleteShader(_fragmentShader)
  }

  render(): void {
    const {
      _glOut,
      _outputDimensions: {
        height,
        width
      },
      _outputFramebuffer,
      _outputTexture,
      _outputTextureUnit,
      _program
    } = this

    _glOut.viewport(0, 0, width, height)
    _glOut.useProgram(_program)

    if (_outputTexture) {
      _glOut.activeTexture(
        _glOut.TEXTURE0
        + _outputTextureUnit
      )
      _glOut.bindTexture(
        _glOut.TEXTURE_2D,
        _outputTexture
      )
    }
    _glOut.bindFramebuffer(
      _glOut.FRAMEBUFFER,
      _outputFramebuffer
    )
    _glOut.drawArrays(
      _glOut.TRIANGLE_STRIP,
      0,
      4
    )
  }

  protected _setUniformVars(uniformVars: UniformVarInfo[]) {
    const {
      _glOut,
      _program
    } = this

    _glOut.useProgram(_program)

    uniformVars.forEach(({
      name,
      type,
      values
    }) => {
      const uniformVarLocation = _glOut
        .getUniformLocation(
          _program,
          name
        )

      const isVector = type.split(':')[1] === 'v';
      if (isVector) {
        // @ts-ignore
        _glOut[`uniform1${type[0]}v`](
          uniformVarLocation,
          values
        )
      } else {
        // @ts-ignore
        _glOut[`uniform${values.length}${type[0]}`](
          uniformVarLocation,
          ...values
        )
      }
    })
  }
}

/**
 * @private
 */
export class WebGL2Pipeline extends Pipeline {
  static InputStage = WebGL2PipelineInputStage
  static ProcessingStage = WebGL2PipelineProcessingStage
  protected _stages: (WebGL2PipelineInputStage | WebGL2PipelineProcessingStage)[] = []

  cleanUp(): void {
    this._stages.forEach(
      (stage) => stage.cleanUp()
    )
  }

  render(inputFrame?: OffscreenCanvas | HTMLCanvasElement | HTMLVideoElement | VideoFrame): void {
    const [inputStage, ...otherStages] = this._stages;
    inputStage.render(inputFrame);
    otherStages.forEach(
      (stage) => (stage as WebGL2PipelineProcessingStage)
        .render()
    );
  }

  setInputTextureData(inputTextureData: ImageData): void {
    const [inputStage] = this._stages as [WebGL2PipelineInputStage]
    inputStage.setInputTextureData(inputTextureData);
  }
}

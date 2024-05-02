import { Dimensions } from '../../../types'
import {
  createPipelineStageProgram,
  createTexture,
  compileShader,
  initBuffer,
  readPixelsAsync
} from '../helpers/webglHelper'
import { Pipeline } from './pipeline'

class WebGL2PipelineInputStage implements Pipeline.Stage {
  private _glOut: WebGL2RenderingContext
  private _outputTexture: WebGLTexture
  private _videoIn: HTMLVideoElement

  constructor(
    videoIn: HTMLVideoElement,
    glOut: WebGL2RenderingContext
  ) {
    const {
      videoHeight,
      videoWidth
    } = videoIn

    this._glOut = glOut
    this._outputTexture = createTexture(
      glOut,
      glOut.RGBA8,
      videoWidth,
      videoHeight,
      glOut.NEAREST,
      glOut.NEAREST,
      false
    )!
    this._videoIn = videoIn
  }

  cleanup(): void {
    const {
      _glOut,
      _outputTexture
    } = this
    _glOut.deleteTexture(_outputTexture)
  }

  render(): void {
    const {
      _glOut,
      _outputTexture,
      _videoIn
    } = this

    const {
      videoHeight,
      videoWidth
    } = _videoIn

    _glOut.viewport(0, 0, videoWidth, videoHeight)
    _glOut.clearColor(0, 0, 0, 0)
    _glOut.clear(_glOut.COLOR_BUFFER_BIT)
    _glOut.activeTexture(_glOut.TEXTURE0)

    _glOut.bindTexture(
      _glOut.TEXTURE_2D,
      _outputTexture
    )
    _glOut.texImage2D(
      _glOut.TEXTURE_2D,
      0,
      _glOut.RGBA,
      _glOut.RGBA,
      _glOut.UNSIGNED_BYTE,
      _videoIn
    )
  }
}

class WebGL2PipelineProcessingStage implements Pipeline.Stage {
  private _fragmentShader: WebGLSampler
  private _glOut: WebGL2RenderingContext
  private _inputTextureUnit: number
  private _outputDimensions: Dimensions
  private _outputFramebuffer: WebGLBuffer | null = null
  private _outputTexture: WebGLTexture | null = null
  private _outputTextureData: ImageData | null = null
  private _outputTextureTransform: ((textureData: ImageData) => void) | null = null
  private _positionBuffer: WebGLBuffer
  private _program: WebGLProgram
  private _texCoordBuffer: WebGLBuffer
  private _vertexShader: WebGLShader

  constructor(
    inputConfig: {
      textureName: string
      textureUnit: number
    },
    outputConfig: {
      fragmentShaderSource: string
      glOut: WebGL2RenderingContext
      height?: number
      textureTransform?: (textureData: ImageData) => void
      type: 'canvas' | 'texture'
      uniformVars?: {
        name: string
        type: 'float' | 'int' | 'uint'
        values: number[]
      }[]
      width?: number
    }
  ) {
    const {
      textureName,
      textureUnit,
    } = inputConfig

    this._inputTextureUnit = textureUnit

    const { glOut } = outputConfig
    this._glOut = glOut

    const {
      fragmentShaderSource,
      height = glOut.canvas.height,
      textureTransform = null,
      type: outputType,
      uniformVars = [],
      width = glOut.canvas.width
    } = outputConfig

    this._outputDimensions = {
      height,
      width
    }
    this._outputTextureTransform = textureTransform
    if (textureTransform) {
      this._outputTextureData = new ImageData(
        width,
        height
      )
    }

    this._fragmentShader = compileShader(
      glOut,
      glOut.FRAGMENT_SHADER,
      fragmentShaderSource
    )
    this._outputTextureTransform = textureTransform

    const vertexShaderSource = `#version 300 es
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
    `

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

    const inputTextureLocation = glOut
      .getUniformLocation(
        program,
        textureName
      )

    glOut.useProgram(program)
    glOut.uniform1i(
      inputTextureLocation,
      textureUnit
    )

    uniformVars.forEach(({
      name,
      type,
      values
    }) => {
      const uniformVarLocation = glOut
        .getUniformLocation(
          program,
          name
        )

      // @ts-ignore
      glOut[`uniform${values.length}${type[0]}`](
        uniformVarLocation,
        ...values
      )
    })
  }

  cleanup(): void {
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
      _inputTextureUnit,
      _outputDimensions: {
        height,
        width
      },
      _outputFramebuffer,
      _outputTexture,
      _outputTextureData,
      _outputTextureTransform,
      _program
    } = this

    _glOut.viewport(0, 0, width, height)
    _glOut.useProgram(_program)
    
    if (_outputTexture) {
      _glOut.activeTexture(
        _glOut.TEXTURE0
        + _inputTextureUnit
        + 1
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
    if (_outputTextureTransform) {
      readPixelsAsync(
        _glOut,
        0,
        0,
        width,
        height,
        _glOut.RGBA,
        _glOut.UNSIGNED_BYTE,
        _outputTextureData!.data
      )
      _outputTextureTransform(
        _outputTextureData!
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
        _outputTextureData!.data
      )
    }
  }
}

export class WebGL2Pipeline extends Pipeline {
  static InputStage = WebGL2PipelineInputStage
  static ProcessingStage = WebGL2PipelineProcessingStage
  protected _stages: (WebGL2PipelineInputStage | WebGL2PipelineProcessingStage)[] = []

  cleanUp(): void {
    this._stages.forEach((stage) => {
      stage.cleanup()
    })
  }
}

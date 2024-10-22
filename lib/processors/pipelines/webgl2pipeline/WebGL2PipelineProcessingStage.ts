import { Dimensions } from '../../../types';
import { Pipeline } from '../Pipeline';
import { compileShader, createPipelineStageProgram, createTexture, initBuffer } from './webgl2PipelineHelpers';

interface InputConfig {
  textureName: string;
  textureUnit: number;
}

interface OutputConfig {
  fragmentShaderSource: string;
  glOut: WebGL2RenderingContext;
  height?: number;
  textureUnit?: number;
  type: 'canvas' | 'texture';
  uniformVars?: UniformVarInfo[];
  vertexShaderSource?: string;
  width?: number;
}

interface UniformVarInfo {
  name: string;
  type: 'float' | 'int' | 'uint' | 'float:v';
  values: number[];
}

/**;
 * @private
 */
export class WebGL2PipelineProcessingStage implements Pipeline.Stage {
  protected readonly _outputDimensions: Dimensions;
  private readonly _fragmentShader: WebGLSampler;
  private readonly _glOut: WebGL2RenderingContext;
  private readonly _outputFramebuffer: WebGLBuffer | null = null;
  private readonly _outputTexture: WebGLTexture | null = null;
  private readonly _outputTextureUnit: number;
  private readonly _positionBuffer: WebGLBuffer;
  private readonly _program: WebGLProgram;
  private readonly _texCoordBuffer: WebGLBuffer;
  private readonly _vertexShader: WebGLShader;

  constructor(
    inputConfig: InputConfig,
    outputConfig: OutputConfig
  ) {
    const {
      textureName,
      textureUnit,
    } = inputConfig;

    const { glOut } = outputConfig;
    this._glOut = glOut;

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
    } = outputConfig;

    this._outputDimensions = {
      height,
      width
    };

    this._outputTextureUnit = outputTextureUnit;

    this._fragmentShader = compileShader(
      glOut,
      glOut.FRAGMENT_SHADER,
      fragmentShaderSource
    );

    this._vertexShader = compileShader(
      glOut,
      glOut.VERTEX_SHADER,
      vertexShaderSource
    );

    this._positionBuffer = initBuffer(
      glOut,
      [
        -1.0, -1.0,
        1.0, -1.0,
        -1.0, 1.0,
        1.0, 1.0,
      ]
    )!;

    this._texCoordBuffer = initBuffer(
      glOut,
      [
        0.0, 0.0,
        1.0, 0.0,
        0.0, 1.0,
        1.0, 1.0,
      ]
    )!;

    if (outputType === 'texture') {
      this._outputTexture = createTexture(
        glOut,
        glOut.RGBA8,
        width,
        height
      );
      this._outputFramebuffer = glOut.createFramebuffer();
      glOut.bindFramebuffer(
        glOut.FRAMEBUFFER,
        this._outputFramebuffer
      );
      glOut.framebufferTexture2D(
        glOut.FRAMEBUFFER,
        glOut.COLOR_ATTACHMENT0,
        glOut.TEXTURE_2D,
        this._outputTexture,
        0
      );
    }

    const program = createPipelineStageProgram(
      glOut,
      this._vertexShader,
      this._fragmentShader,
      this._positionBuffer,
      this._texCoordBuffer
    );
    this._program = program;

    this._setUniformVars([
      {
        name: textureName,
        type: 'int',
        values: [textureUnit]
      },
      ...uniformVars
    ]);
  }

  cleanUp(): void {
    const {
      _fragmentShader,
      _glOut,
      _positionBuffer,
      _program,
      _texCoordBuffer,
      _vertexShader
    } = this;
    _glOut.deleteProgram(_program);
    _glOut.deleteBuffer(_texCoordBuffer);
    _glOut.deleteBuffer(_positionBuffer);
    _glOut.deleteShader(_vertexShader);
    _glOut.deleteShader(_fragmentShader);
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
    } = this;

    _glOut.viewport(0, 0, width, height);
    _glOut.useProgram(_program);

    if (_outputTexture) {
      _glOut.activeTexture(
        _glOut.TEXTURE0
        + _outputTextureUnit
      );
      _glOut.bindTexture(
        _glOut.TEXTURE_2D,
        _outputTexture
      );
    }
    _glOut.bindFramebuffer(
      _glOut.FRAMEBUFFER,
      _outputFramebuffer
    );
    _glOut.drawArrays(
      _glOut.TRIANGLE_STRIP,
      0,
      4
    );
  }

  protected _setUniformVars(uniformVars: UniformVarInfo[]) {
    const {
      _glOut,
      _program
    } = this;

    _glOut.useProgram(_program);

    uniformVars.forEach(({ name, type, values }) => {
      const uniformVarLocation = _glOut
        .getUniformLocation(
          _program,
          name
        );
      const isVector = type.split(':')[1] === 'v';
      if (isVector) {
        // @ts-ignore
        _glOut[`uniform1${type[0]}v`](
          uniformVarLocation,
          values
        );
      } else {
        // @ts-ignore
        _glOut[`uniform${values.length}${type[0]}`](
          uniformVarLocation,
          ...values
        );
      }
    });
  }
}

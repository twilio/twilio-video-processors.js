import { Dimensions } from '../../../types';
import { Pipeline } from '../Pipeline';
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
export declare class WebGL2PipelineProcessingStage implements Pipeline.Stage {
    protected readonly _outputDimensions: Dimensions;
    private readonly _fragmentShader;
    private readonly _glOut;
    private readonly _outputFramebuffer;
    private readonly _outputTexture;
    private readonly _outputTextureUnit;
    private readonly _positionBuffer;
    private readonly _program;
    private readonly _texCoordBuffer;
    private readonly _vertexShader;
    constructor(inputConfig: InputConfig, outputConfig: OutputConfig);
    cleanUp(): void;
    render(): void;
    protected _setUniformVars(uniformVars: UniformVarInfo[]): void;
}
export {};

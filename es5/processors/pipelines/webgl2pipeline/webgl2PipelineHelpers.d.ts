/**
 * @private
 */
export declare function createPipelineStageProgram(gl: WebGL2RenderingContext, vertexShader: WebGLShader, fragmentShader: WebGLShader, positionBuffer: WebGLBuffer, texCoordBuffer: WebGLBuffer): WebGLProgram;
/**
 * @private
 */
export declare function createProgram(gl: WebGL2RenderingContext, vertexShader: WebGLShader, fragmentShader: WebGLShader): WebGLProgram;
/**
 * @private
 */
export declare function compileShader(gl: WebGL2RenderingContext, shaderType: number, shaderSource: string): WebGLShader;
/**
 * @private
 */
export declare function createTexture(gl: WebGL2RenderingContext, internalformat: number, width: number, height: number, minFilter?: GLint, magFilter?: GLint): WebGLTexture | null;
/**
 * @private
 */
export declare function initBuffer(gl: WebGL2RenderingContext, data: number[]): WebGLBuffer | null;

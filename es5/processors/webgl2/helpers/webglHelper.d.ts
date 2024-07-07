/**
 * Use it along with boyswan.glsl-literal VSCode extension
 * to get GLSL syntax highlighting.
 * https://marketplace.visualstudio.com/items?itemName=boyswan.glsl-literal
 *
 * On VSCode OSS, boyswan.glsl-literal requires slevesque.shader extension
 * to be installed as well.
 * https://marketplace.visualstudio.com/items?itemName=slevesque.shader
 */
export declare const glsl: (template: {
    raw: ArrayLike<string> | readonly string[];
}, ...substitutions: any[]) => string;
export declare function createPiplelineStageProgram(gl: WebGL2RenderingContext, vertexShader: WebGLShader, fragmentShader: WebGLShader, positionBuffer: WebGLBuffer, texCoordBuffer: WebGLBuffer): WebGLProgram;
export declare function createProgram(gl: WebGL2RenderingContext, vertexShader: WebGLShader, fragmentShader: WebGLShader): WebGLProgram;
export declare function compileShader(gl: WebGL2RenderingContext, shaderType: number, shaderSource: string): WebGLShader;
export declare function createTexture(gl: WebGL2RenderingContext, internalformat: number, width: number, height: number, minFilter?: GLint, magFilter?: GLint): WebGLTexture | null;

export type BackgroundBlurStage = {
    render(): void;
    updateCoverage(coverage: [number, number]): void;
    cleanUp(): void;
};
export declare function buildBackgroundBlurStage(gl: WebGL2RenderingContext, vertexShader: WebGLShader, positionBuffer: WebGLBuffer, texCoordBuffer: WebGLBuffer, personMaskTexture: WebGLTexture, canvas: HTMLCanvasElement): BackgroundBlurStage;

import { BlendMode } from '../helpers/postProcessingHelper';
export declare type BackgroundImageStage = {
    render(): void;
    updateCoverage(coverage: [number, number]): void;
    updateLightWrapping(lightWrapping: number): void;
    updateBlendMode(blendMode: BlendMode): void;
    cleanUp(): void;
};
export declare function buildBackgroundImageStage(gl: WebGL2RenderingContext, positionBuffer: WebGLBuffer, texCoordBuffer: WebGLBuffer, personMaskTexture: WebGLTexture, backgroundImage: HTMLImageElement | null, canvas: HTMLCanvasElement): BackgroundImageStage;

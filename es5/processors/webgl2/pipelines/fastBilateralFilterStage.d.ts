import { SegmentationConfig } from '../helpers/segmentationHelper';
export declare function buildFastBilateralFilterStage(gl: WebGL2RenderingContext, vertexShader: WebGLShader, positionBuffer: WebGLBuffer, texCoordBuffer: WebGLBuffer, inputTexture: WebGLTexture, segmentationConfig: SegmentationConfig, outputTexture: WebGLTexture, canvas: HTMLCanvasElement): {
    render: () => void;
    updateSigmaSpace: (sigmaSpace: number) => void;
    updateSigmaColor: (sigmaColor: number) => void;
    cleanUp: () => void;
};

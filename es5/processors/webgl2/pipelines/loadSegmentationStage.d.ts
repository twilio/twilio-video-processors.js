import { SegmentationConfig } from '../helpers/segmentationHelper';
export declare function buildLoadSegmentationStage(gl: WebGL2RenderingContext, vertexShader: WebGLShader, positionBuffer: WebGLBuffer, texCoordBuffer: WebGLBuffer, segmentationConfig: SegmentationConfig, outputTexture: WebGLTexture): {
    render: (segmentationData: Uint8ClampedArray) => void;
    cleanUp: () => void;
};

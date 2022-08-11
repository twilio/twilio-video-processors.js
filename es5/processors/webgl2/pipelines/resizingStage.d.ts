import { SegmentationConfig } from '../helpers/segmentationHelper';
export declare function buildResizingStage(gl: WebGL2RenderingContext, vertexShader: WebGLShader, positionBuffer: WebGLBuffer, texCoordBuffer: WebGLBuffer, segmentationConfig: SegmentationConfig, tflite: any): {
    render: () => void;
    cleanUp: () => void;
};

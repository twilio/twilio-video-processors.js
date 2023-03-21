export declare type BlendMode = 'screen' | 'linearDodge';
export declare type PostProcessingConfig = {
    smoothSegmentationMask: boolean;
    jointBilateralFilter: JointBilateralFilterConfig;
    coverage: [number, number];
    lightWrapping: number;
    blendMode: BlendMode;
};
export declare type JointBilateralFilterConfig = {
    sigmaSpace: number;
    sigmaColor: number;
};

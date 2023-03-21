export declare type InputResolution = '640x360' | '256x256' | '256x144' | '160x96' | string;
export declare const inputResolutions: {
    [resolution in InputResolution]: [number, number];
};
export declare type SegmentationConfig = {
    inputResolution: InputResolution;
};

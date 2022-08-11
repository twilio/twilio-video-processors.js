export declare type SourceConfig = {
    type: 'image' | 'video' | 'camera';
    url?: string;
};
export declare type SourcePlayback = {
    htmlElement: HTMLImageElement | HTMLVideoElement;
    width: number;
    height: number;
};

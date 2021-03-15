export interface Resolution {
    height: number;
    width: number;
}
export interface Timing {
    delay?: number;
    end?: number;
    start?: number;
}
export declare enum ImageFit {
    Contain = "Contain",
    Cover = "Cover",
    Fill = "Fill",
    None = "None"
}

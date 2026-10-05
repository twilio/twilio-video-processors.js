/**
 * @private
 */
export declare class TwilioTFLite {
    private _inputBuffer;
    private _isSimdEnabled;
    private _tflite;
    get isSimdEnabled(): boolean | null;
    initialize(assetsPath: string, modelName: string, moduleLoaderName: string, moduleSimdLoaderName: string): Promise<void>;
    loadInputBuffer(inputBuffer: Uint8ClampedArray): void;
    runInference(): Uint8ClampedArray;
    private _loadScript;
    private _loadWasmModule;
}

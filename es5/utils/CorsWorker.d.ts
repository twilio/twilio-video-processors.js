export declare class CorsWorker {
    readonly workerPromise: Promise<Worker>;
    constructor(url: string);
    private _loadCrossOrigin;
    private _loadSameOrigin;
}

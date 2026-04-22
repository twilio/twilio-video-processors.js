/**
 * @private
 */
export declare class Benchmark {
    static readonly cacheSize = 41;
    private _timingCache;
    private _timings;
    constructor();
    end(name: string): void;
    getAverageDelay(name: string): number | undefined;
    getNames(): string[];
    getRate(name: string): number | undefined;
    merge(benchmark: Benchmark): void;
    start(name: string): void;
    private _save;
}

import { Timing } from '../types';

/**
 * @private
 */
export class Benchmark {

  // NOTE (csantos): How many timing information to save per benchmark.
  // This is about the amount of timing info generated on a 24fps input.
  // Enough samples to calculate fps
  static readonly cacheSize = 41;

  private _timingCache: Map<string, Timing[]>;
  private _timings: Map<string, Timing>;

  constructor() {
    this._timingCache = new Map();
    this._timings = new Map();
  }

  end(name: string) {
    const timing = this._timings.get(name);
    if (!timing) {
      return;
    }
    timing.end = Date.now();
    timing.delay = timing.end - timing.start!;
    this._save(name, {...timing});
  }

  getAverageDelay(name: string): number | undefined {
    const timingCache = this._timingCache.get(name);
    if (!timingCache || !timingCache.length) {
      return;
    }
    return timingCache.map(timing => timing.delay!)
      .reduce((total: number, value: number) => total += value, 0) / timingCache.length;
  }

  getNames(): string[] {
    return Array.from(this._timingCache.keys());
  }

  getRate(name: string): number | undefined {
    const timingCache = this._timingCache.get(name);
    if (!timingCache || timingCache.length < 2) {
      return;
    }
    const totalDelay = timingCache[timingCache.length - 1].end! - timingCache[0].start!;
    return (timingCache.length / totalDelay) * 1000;
  }

  merge(benchmark: Benchmark) {
    const { _timingCache, _timings } = benchmark;
    _timingCache.forEach(
      (cache, name) => this._timingCache.set(name, cache)
    );
    _timings.forEach(
      (timing, name) => this._timings.set(name, timing)
    );
  }

  start(name: string) {
    let timing = this._timings.get(name);
    if (!timing) {
      timing = {};
      this._timings.set(name, timing);
    }
    timing.start = Date.now();
    delete timing.end;
    delete timing.delay;
  }

  private _save(name: string, timing: Timing) {
    let timingCache = this._timingCache.get(name);
    if (!timingCache) {
      timingCache = [];
      this._timingCache.set(name, timingCache);
    }

    timingCache.push(timing);

    if (timingCache.length > Benchmark.cacheSize) {
      timingCache.splice(0, timingCache.length - Benchmark.cacheSize);
    }
  }
}

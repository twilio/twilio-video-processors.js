"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Benchmark = void 0;
/**
 * @private
 */
var Benchmark = /** @class */ (function () {
    function Benchmark() {
        this._timingCache = new Map();
        this._timings = new Map();
    }
    Benchmark.prototype.end = function (name) {
        var timing = this._timings.get(name);
        if (!timing) {
            return;
        }
        timing.end = Date.now();
        timing.delay = timing.end - timing.start;
        this._save(name, __assign({}, timing));
    };
    Benchmark.prototype.getAverageDelay = function (name) {
        var timingCache = this._timingCache.get(name);
        if (!timingCache || !timingCache.length) {
            return;
        }
        return timingCache.map(function (timing) { return timing.delay; })
            .reduce(function (total, value) { return total += value; }, 0) / timingCache.length;
    };
    Benchmark.prototype.getNames = function () {
        return Array.from(this._timingCache.keys());
    };
    Benchmark.prototype.getRate = function (name) {
        var timingCache = this._timingCache.get(name);
        if (!timingCache || timingCache.length < 2) {
            return;
        }
        var totalDelay = timingCache[timingCache.length - 1].end - timingCache[0].start;
        return (timingCache.length / totalDelay) * 1000;
    };
    Benchmark.prototype.start = function (name) {
        var timing = this._timings.get(name);
        if (!timing) {
            timing = {};
            this._timings.set(name, timing);
        }
        timing.start = Date.now();
        delete timing.end;
        delete timing.delay;
    };
    Benchmark.prototype._save = function (name, timing) {
        var timingCache = this._timingCache.get(name);
        if (!timingCache) {
            timingCache = [];
            this._timingCache.set(name, timingCache);
        }
        timingCache.push(timing);
        if (timingCache.length > Benchmark.cacheSize) {
            timingCache.splice(0, timingCache.length - Benchmark.cacheSize);
        }
    };
    // NOTE (csantos): How many timing information to save per benchmark.
    // This is about the amount of timing info generated on a 24fps input.
    // Enough samples to calculate fps
    Benchmark.cacheSize = 41;
    return Benchmark;
}());
exports.Benchmark = Benchmark;
//# sourceMappingURL=Benchmark.js.map
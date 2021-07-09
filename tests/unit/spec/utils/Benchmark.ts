import * as assert from 'assert';
import * as sinon from 'sinon';
import { Benchmark } from '../../../../lib/utils/Benchmark';

describe('Benchmark', () => {
  let clock: sinon.SinonFakeTimers;
  let benchmark: Benchmark;

  beforeEach(() => {
    clock = sinon.useFakeTimers(Date.now());
    benchmark = new Benchmark();
  });

  it('should properly calculate delay', () => {
    benchmark.start('foo');
    clock.tick(1000);
    benchmark.end('foo');

    assert.strictEqual(benchmark.getAverageDelay('foo'), 1000);
  });

  it('should properly calculate average delay', () => {
    benchmark.start('foo');
    clock.tick(1000);
    benchmark.end('foo');

    benchmark.start('foo');
    clock.tick(2000);
    benchmark.end('foo');

    assert.strictEqual(benchmark.getAverageDelay('foo'), 1500);
  });

  it('should return undefined if averaging non-existing timer', () => {
    assert.strictEqual(benchmark.getAverageDelay('foo'), undefined);
  });

  it('should save more than one timers', () => {
    benchmark.start('foo');
    clock.tick(1000);
    benchmark.end('foo');

    benchmark.start('bar');
    clock.tick(2000);
    benchmark.end('bar');

    assert.strictEqual(benchmark.getAverageDelay('foo'), 1000);
    assert.strictEqual(benchmark.getAverageDelay('bar'), 2000);
  });

  it('should average more than one timers', () => {
    benchmark.start('foo');
    clock.tick(1000);
    benchmark.end('foo');
    benchmark.start('foo');
    clock.tick(2000);
    benchmark.end('foo');

    benchmark.start('bar');
    clock.tick(2000);
    benchmark.end('bar');
    benchmark.start('bar');
    clock.tick(3000);
    benchmark.end('bar');

    assert.strictEqual(benchmark.getAverageDelay('foo'), 1500);
    assert.strictEqual(benchmark.getAverageDelay('bar'), 2500);
  });

  it('should properly restart timer', () => {
    benchmark.start('foo');
    clock.tick(1000);
    benchmark.start('foo');
    clock.tick(1500);
    benchmark.start('foo');
    clock.tick(2000);
    benchmark.start('foo');
    clock.tick(2500);
    benchmark.end('foo');

    assert.strictEqual(benchmark.getAverageDelay('foo'), 2500);
  });

  it('should not affect an existing timer after ending a timer that does not exists', () => {
    benchmark.start('foo');
    clock.tick(1000);
    benchmark.end('foo');

    benchmark.start('foo');
    clock.tick(2000);
    benchmark.end('foo');
    benchmark.end('bar');
    benchmark.end('bar');
    benchmark.end('bar');
    benchmark.end('bar');

    assert.strictEqual(benchmark.getAverageDelay('foo'), 1500);
    assert.strictEqual(benchmark.getAverageDelay('bar'), undefined);
  });

  it('should not exceed cache size', () => {
    const cacheSize = 41;
    // Purposely exceed the cache to check if it handles it fine
    const extraLoops = 10;
    const delays = [];

    for(let a = 1; a <= (cacheSize + extraLoops); a++) {
      const delay = a * 500;
      benchmark.start('foo');
      clock.tick(delay);
      benchmark.end('foo');
  
      benchmark.start('bar');
      clock.tick(delay);
      benchmark.end('bar');

      delays.push(delay);
    }

    const average = (items: number[]) => 
      items.reduce((total: number, value: number) => total += value, 0) / items.length;

    delays.splice(0, delays.length - cacheSize);

    assert.strictEqual(benchmark.getAverageDelay('foo'), average(delays));
    assert.strictEqual(benchmark.getAverageDelay('bar'), average(delays));
  });

  it('should return timer names', () => {
    benchmark.start('foo');
    clock.tick(1000);
    benchmark.end('foo');

    benchmark.start('bar');
    clock.tick(2000);
    benchmark.end('bar');

    assert.deepStrictEqual(benchmark.getNames(), ['foo', 'bar']);
  });

  it('should return timer rate', () => {
    benchmark.start('foo');
    clock.tick(1000);
    benchmark.end('foo');

    benchmark.start('foo');
    clock.tick(2000);
    benchmark.end('foo');

    benchmark.start('foo');
    clock.tick(3000);
    benchmark.end('foo');

    assert.strictEqual(benchmark.getRate('foo'), 0.5);
  });

  it('should not return timer rate if there is only one data', () => {
    benchmark.start('foo');
    clock.tick(1000);
    benchmark.end('foo');

    assert.strictEqual(benchmark.getRate('foo'), undefined);
  });

  it('should not return timer rate if there is no data', () => {
    assert.strictEqual(benchmark.getRate('foo'), undefined);
  });
});

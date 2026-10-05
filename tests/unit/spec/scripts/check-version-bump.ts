import * as assert from 'assert';

const { compare, isForward, parse } = require('../../../../scripts/check-version-bump');

describe('check-version-bump', () => {
  describe('parse', () => {
    it('splits a final version', () => {
      assert.deepStrictEqual(parse('3.2.1'), { numbers: [3, 2, 1], prerelease: [] });
    });

    it('splits a dotted prerelease', () => {
      assert.deepStrictEqual(parse('3.2.0-rc.1'), { numbers: [3, 2, 0], prerelease: ['rc', '1'] });
    });

    [' 3.2.1', '3.2', 'v3.2.1', '3.2.1.1', 'patch', '3.2.1\n3.2.1', ''].forEach(version => {
      it(`returns null for ${JSON.stringify(version)}`, () => {
        assert.strictEqual(parse(version), null);
      });
    });
  });

  describe('compare', () => {
    it('orders a final version above its own prerelease', () => {
      assert.strictEqual(compare('3.2.0', '3.2.0-rc.1'), 1);
    });

    it('treats identical versions as equal', () => {
      assert.strictEqual(compare('3.2.0', '3.2.0'), 0);
    });

    it('orders numeric prerelease identifiers numerically, not lexically', () => {
      assert.strictEqual(compare('3.0.0-preview.10', '3.0.0-preview.9'), 1);
    });

    it('orders a numeric identifier below an alphanumeric one', () => {
      assert.strictEqual(compare('3.0.0-1', '3.0.0-beta'), -1);
    });

    it('orders a longer identifier set above its own prefix', () => {
      assert.strictEqual(compare('3.0.0-rc.1', '3.0.0-rc'), 1);
    });

    it('throws on a version it cannot parse', () => {
      assert.throws(() => compare('3.2.1', 'patch'), /not an exact version/);
    });
  });

  describe('isForward', () => {
    describe('allows a final release cut from X.Y.Z-dev or from its release candidate', () => {
      [
        ['3.2.1-dev', '3.2.1'],
        ['3.2.0-rc.1', '3.2.0'],
        ['3.1.0-rc.1', '3.1.0'],
      ].forEach(([current, next]) => {
        it(`${current} -> ${next}`, () => {
          assert.strictEqual(isForward(current, next), true);
        });
      });
    });

    describe('allows a prerelease', () => {
      [
        ['3.2.0-dev', '3.2.0-rc.1'],
        ['3.0.0-preview.1', '3.0.0-preview.2'],
        ['3.1.1-dev', '3.2.0-rc.1'],
        // Labels that semver orders below "dev".
        ['3.0.0-dev', '3.0.0-beta.1'],
        ['3.2.1-dev', '3.2.1-alpha.1'],
      ].forEach(([current, next]) => {
        it(`${current} -> ${next}`, () => {
          assert.strictEqual(isForward(current, next), true);
        });
      });
    });

    describe('allows the next development version after a final release', () => {
      [
        ['3.2.1', '3.2.2-dev'],
        ['3.2.1', '3.3.0-dev'],
      ].forEach(([current, next]) => {
        it(`${current} -> ${next}`, () => {
          assert.strictEqual(isForward(current, next), true);
        });
      });
    });

    describe('rejects a version that does not move forward', () => {
      [
        // A transposed minor and patch: 3.1.2 in place of 3.2.1.
        ['3.2.1-dev', '3.1.2'],
        ['3.2.0', '3.2.0'],
        ['3.2.1-dev', '3.2.0'],
        ['3.2.0', '3.2.0-rc.2'],
        ['3.2.1-dev', '3.2.1-dev'],
        ['3.2.1-dev', '3.2.0-beta.1'],
        ['3.2.1-rc.1', '3.2.1-beta.1'],
        // The next development version after a final release.
        ['3.2.1', '3.2.1'],
        ['3.2.1', '3.2.1-dev'],
      ].forEach(([current, next]) => {
        it(`${current} -> ${next}`, () => {
          assert.strictEqual(isForward(current, next), false);
        });
      });
    });
  });
});

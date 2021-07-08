import * as assert from 'assert';
import { version } from '../../../lib/index';

const packageVersion = require('../../../package.json').version;

describe('version', () => {
  it('should set correct version', () => {
    assert.strictEqual(version, packageVersion);
  });
});

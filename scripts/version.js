'use strict';

const fs = require('fs');
const pkg = require('../package.json');

fs.writeFileSync('./lib/utils/version.ts', `\
// This file is generated on build. To make changes, see scripts/version.js

/**
 * The current version of the library.
 */
export const version: string = '${pkg.version}';
`);

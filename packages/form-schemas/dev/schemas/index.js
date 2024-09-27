'use strict';

const _ = require('lodash');

module.exports = require('node:fs')
  .readdirSync(__dirname)
  .filter((f) => f !== 'index.js')
  // eslint-disable-next-line global-require,import/no-dynamic-require
  .reduce((mw, f) => _.set(mw, f.split('.')[0], require(`./${f}`)), {});

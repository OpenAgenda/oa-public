'use strict';

const fs = require('node:fs');
const _ = require('lodash');

const mw = fs
  .readdirSync(__dirname)
  .filter((f) => f !== 'index.js')
  // eslint-disable-next-line import/no-dynamic-require,global-require
  .reduce((mw1, f) => _.set(mw1, f.split('.')[0], require(`./${f}`)), {});

module.exports = (req, res, next) => {
  const matchingMw = mw[req.path.split('/').pop()];

  if (matchingMw) {
    matchingMw(req, res, next);
  } else {
    next();
  }
};

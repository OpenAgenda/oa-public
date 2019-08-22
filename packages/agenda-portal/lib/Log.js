'use strict';

const _ = require('lodash');

module.exports = namespace => (...args) => {
  console.log.apply(
    null,
    [`${namespace}: ${_.get(args, '0', '')}`].concat(args.slice(1))
  );
};

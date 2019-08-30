'use strict';

const _ = require('lodash');

let createLog = namespace => (...args) => {
  console.log(
    ...[`${namespace}: ${_.get(args, '0', '')}`].concat(args.slice(1))
  );
};

module.exports = namespace => (...args) => createLog(namespace)(...args);

module.exports.set = logger => {
  createLog = logger;
};

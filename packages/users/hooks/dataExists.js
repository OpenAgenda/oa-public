'use strict';

const { existsByDot } = require('feathers-hooks-common');

module.exports = function dataExists(key) {
  return context => existsByDot(context.data, key);
};

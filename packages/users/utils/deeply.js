'use strict';

const _ = require('lodash');

module.exports = function deeply(map) {
  return (obj, fn) => map(
    _.mapValues(obj, v => (_.isPlainObject(v) ? deeply(map)(v, fn) : v)),
    fn
  );
};

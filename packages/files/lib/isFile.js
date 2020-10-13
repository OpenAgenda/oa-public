'use strict';

const isStream = require('is-stream');

module.exports = function isFile(value) {
  return isStream(value) || (value && value.path);
}

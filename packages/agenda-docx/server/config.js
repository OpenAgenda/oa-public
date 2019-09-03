'use strict';

const _ = require('lodash');

const config = {};

function init(c) {
  _.extend(config, c);
}

module.exports = _.extend(config, { init });

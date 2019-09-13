'use strict';

const _ = require('lodash');
const uuid = require('uuid/v4');

module.exports = function generateToken(key) {
  return async context => {
    const token = uuid().replace(/-/g, '');

    _.set(context, key, token);

    return context;
  };
};

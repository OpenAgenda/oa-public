'use strict';

const _ = require('lodash');

module.exports = function applyMask(activity) {
  const { mask, ...rest } = activity;

  if (mask) {
    return _.omit(rest, JSON.parse(mask));
  }

  return rest;
};

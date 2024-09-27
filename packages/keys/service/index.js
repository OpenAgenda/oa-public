'use strict';

const _ = require('lodash');

const create = require('./create');
const get = require('./get');
const list = require('./list');
const update = require('./update');
const remove = require('./remove');

const endpoints = {
  create,
  get,
  list,
  update,
  remove,
};

module.exports = (identifiers) =>
  _.mapValues(endpoints, (v, _k) => v.bind(null, identifiers));

module.exports.init = require('./config').init;

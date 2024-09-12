'use strict';

const _ = require('lodash');
const legacy = require('./service/legacy');
const get = require('./service/get');
const list = require('./service/list');
const create = require('./service/create');
const update = require('./service/update');
const set = require('./service/set');
const remove = require('./service/remove');
const transferFromLegacy = require('./service/legacy/transfer');

const endpoints = {
  get,
  list,
  create,
  update,
  set,
  remove,
  transferFromLegacy,
};

module.exports = _.assign(
  (formSchemaId) => _.mapValues(endpoints, (v) => v.bind(null, formSchemaId)),
  _.pick(require('./service/config'), ['init', 'shutdown', 'getConfig']),
  {
    parseLegacy: transferFromLegacy.parse,
    pushCustomDatasetToLegacy: legacy.setAll,
  },
);

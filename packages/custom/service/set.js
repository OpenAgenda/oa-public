'use strict';

const _ = require('lodash');
const log = require('@openagenda/logs')('set');
const get = require('./get');
const create = require('./create');
const update = require('./update');

const operations = {
  create,
  update,
};

module.exports = async (formSchemaId, identifier, data, options = {}) => {
  log('setting custom data for %s.%s', formSchemaId, identifier);

  const current = await get(formSchemaId, identifier);

  const operation = current ? 'update' : 'create';

  const result = await operations[operation](
    formSchemaId,
    identifier,
    data,
    operation === 'create'
      ? options
      : _.assign({ preloaded: current }, options),
  );

  result.operation = operation;

  return result;
};

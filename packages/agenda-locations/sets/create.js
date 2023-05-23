'use strict';

const _ = require('lodash');
const log = require('@openagenda/logs')('sets/create');
const defineUnique = require('../lib/defineUnique');
const validate = require('./validate');

module.exports = async (service, data = {}) => {
  const clean = validate(data);

  const entry = {
    uid: await defineUnique(service, 'uid', () => Math.ceil(Math.random() * 99999999)),
    title: clean.title,
    created_at: new Date(),
    updated_at: new Date(),
  };

  const [insertedID] = await service.clients
    .knex(service.config.setSchema)
    .insert(entry);

  log('created with id %s and uid %s', insertedID, entry.uid);

  if (service.interfaces.onSetCreate) {
    await service.interfaces.onSetCreate(clean);
  }

  return _.mapKeys(entry, (v, key) => _.camelCase(key));
};

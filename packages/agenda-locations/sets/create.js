import _ from 'lodash';
import logger from '@openagenda/logs';
import defineUnique from '../lib/defineUnique.js';
import validate from './validate.js';

const log = logger('sets/create');

export default async (service, data = {}) => {
  const clean = validate(data);

  const entry = {
    uid: await defineUnique(service, 'uid', () =>
      Math.ceil(Math.random() * 99999999)),
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

import _ from 'lodash';
import logs from '@openagenda/logs';
import get from './get.js';
import create from './create.js';
import update from './update.js';

const log = logs('set');

const operations = {
  create,
  update,
};

export default async (formSchemaId, identifier, data, options = {}) => {
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

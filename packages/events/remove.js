import logs from '@openagenda/logs';
import get from './get.js';
import handleInterface from './lib/handleInterface.js';

const log = logs('remove');

async function remove(service, current, options = {}) {
  log('removing event %s', current.uid);

  await handleInterface(service, 'beforeRemove', current, options.context);

  await service.clients
    .knex(service.config.schema)
    .update({
      deleted_at: new Date(),
    })
    .where('uid', current.uid);

  await handleInterface(service, 'onRemove', current, options.context);

  return current;
}

export default async (service, identifier, options = {}) =>
  remove(
    service,
    await get(service, identifier, {
      ...options,
      throwOnNotFound: true,
    }),
    options,
  );

'use strict';

const log = require('@openagenda/logs')('remove');
const get = require('./get');
const removeLegacy = require('./lib/legacy/remove');
const handleInterface = require('./lib/handleInterface');

async function remove(service, current, options = {}) {
  log('removing event %s', current.uid);

  await handleInterface(service, 'beforeRemove', current, options.context);

  await service.clients.knex(service.config.schema)
    .update({
      deleted_at: new Date()
    }).where('uid', current.uid);

  if (!current.draft) {
    try {
      await removeLegacy(service.clients.knex, current);
    } catch (e) {
      log('warn', 'failed to remove legacy', e);
    }
  }

  await handleInterface(service, 'onRemove', current, options.context);

  return current;
}

module.exports = async (service, identifier, options = {}) => remove(
  service,
  await get(service, identifier, {
    ...options,
    throwOnNotFound: true
  }),
  options
);

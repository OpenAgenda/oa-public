import logs from '@openagenda/logs';
import update from './update.js';
import getIndexName from './utils/getIndexName.js';
import getDocumentId from './utils/getDocumentId.js';
import validateIdentifiers from './utils/validateIdentifiers.js';
import ESToVerror from './utils/ESToVerror.js';

const log = logs('remove');

export default async function remove(config, set, identifiers, options = {}) {
  const { refresh, soft } = {
    refresh: false,
    soft: true,
    ...options,
  };
  validateIdentifiers(identifiers);

  const { client, defaultIndex } = config;
  log('processing', identifiers, { soft });
  if (soft) {
    return update(
      config,
      set,
      identifiers,
      { uid: identifiers.uid, removed: true, updatedAt: new Date() },
      { operation: 'index', refresh },
    );
  }

  let res;

  try {
    res = await client.delete({
      index: getIndexName(set, defaultIndex),
      id: getDocumentId(set, identifiers.uid),
      routing: set,
      refresh,
    });
  } catch (err) {
    throw ESToVerror(err, 'failed to remove event');
  }

  if (res.body.result === 'deleted') {
    log('event %j was removed from set %s', identifiers, set, {
      operation: 'remove',
      set,
      identifiers,
    });
  } else {
    log('warn', 'event %j was not removed from set %s', identifiers, set, {
      operation: 'remove',
      set,
      identifiers,
    });
  }

  return {
    success: res.body.result === 'deleted',
    message:
      res.body.result === 'deleted'
        ? 'event was removed'
        : 'event was not removed',
  };
}

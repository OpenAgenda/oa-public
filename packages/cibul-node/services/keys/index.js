import _ from 'lodash';
import logs from '@openagenda/logs';
import keys from '@openagenda/keys';

import plugApp from './plugApp.js';
import createApiKeyMirror from './lib/apiKeyMirror.js';

const log = logs('services/keys');

export async function init(config, { redis }) {
  await keys.init({
    knex: config.knex,
    schemas: _.pick(config.schemas, 'key', 'user', 'apiKeySet'),
    redis: {
      client: redis,
      prefix: 'keys',
    },
    cache: {
      duration: 60,
    },
  });

  const mirror = createApiKeyMirror(config);

  // D2 dual-write: every write to the legacy `key` table is mirrored into the
  // better-auth `apikey` store. Best-effort — the legacy path stays
  // authoritative and nothing reads `apikey` until D3, so a mirror hiccup must
  // never break key creation; the backfill migration reconciles any drift.
  const wrapped = (identifiers) => {
    const service = keys(identifiers);

    return {
      ...service,
      create: async (data) => {
        const created = await service.create(data);
        try {
          await mirror.upsert(created);
        } catch (err) {
          log('error', 'api_key mirror upsert failed', { identifiers, err });
        }
        return created;
      },
      remove: async (...args) => {
        const removed = await service.remove(...args);
        try {
          await mirror.remove(identifiers);
        } catch (err) {
          log('error', 'api_key mirror remove failed', { identifiers, err });
        }
        return removed;
      },
    };
  };

  return Object.assign(wrapped, keys, { plugApp });
}

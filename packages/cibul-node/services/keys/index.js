import _ from 'lodash';
import logs from '@openagenda/logs';
import keys from '@openagenda/keys';

import plugApp from './plugApp.js';
import createApiKeyMirror from './lib/apiKeyMirror.js';

const log = logs('services/keys');

export async function init(config, { redis }) {
  const mirror = createApiKeyMirror(config);

  // D2 dual-write: every write to the legacy `key` table is mirrored into the
  // better-auth `apikey` store. Wired as service-level hooks (not a wrapper) so
  // BOTH callers go through it — the programmatic `services.keys(...)` factory
  // AND the HTTP middleware (`@openagenda/keys/middleware.js`, used by the
  // agenda-settings key UI). Best-effort: the legacy path stays authoritative
  // and nothing reads `apikey` until D3, so a mirror hiccup must never break
  // key creation; the backfill migration reconciles any drift.
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
    interfaces: {
      onCreate: async (row) => {
        try {
          await mirror.upsert(row);
        } catch (err) {
          log('error', 'api_key mirror upsert failed', {
            type: row?.type,
            identifier: row?.identifier,
            err,
          });
        }
      },
      onRemove: async (row) => {
        try {
          await mirror.remove(row);
        } catch (err) {
          log('error', 'api_key mirror remove failed', {
            type: row?.type,
            identifier: row?.identifier,
            err,
          });
        }
      },
    },
  });

  return Object.assign(keys, { plugApp });
}

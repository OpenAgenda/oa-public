'use strict';

const crypto = require('crypto');
const logs = require('@openagenda/logs');
const getIndexName = require('./utils/getIndexName');
const getDocumentId = require('./utils/getDocumentId');
const formatEvent = require('./utils/formatEvent');

const log = logs('rebuild');

const limit = 10;

const mapping = require('./config/mapping.json');

module.exports = async function rebuild(config, set, options = {}) {
  log('called');
  const operations = [];
  let hasMore = true;
  let lastId = 0;
  let error = null;

  const {
    client,
    defaultIndex,
  } = config;

  const {
    eventsList = null,
    formSchema = null,
    /* on = {
      bulk: () => {},
      error: () => {},
    }, */
  } = options;

  const index = getIndexName(set, defaultIndex);

  if (!await client.indices.exists({ index }).then(r => r.body)) {
    log('creating index', index);
    await client.indices.create({
      index,
      body: {
        mappings: {
          dynamic: false,
          properties: mapping,
        },
        settings: {
          number_of_shards: 5,
          number_of_replicas: 1,
        },
      },
    });
    operations.push(`index created: ${index}`);
  }

  const build = crypto.randomBytes(16).toString('hex');
  operations.push(`generated unique build id: ${build}`);

  const counts = {
    created: 0,
    updated: 0,
    deleted: 0,
    errored: 0,
  };

  try {
    do {
      const {
        lastId: nextLastId,
        events,
      } = await eventsList(lastId, limit);

      log('bulk indexing %s events from %s', events.length, lastId);

      if (events.length) {
        const r = await client.bulk({
          index,
          body: events.reduce((bulkOperations, event) => {
            try {
              return bulkOperations.concat([{
                index: {
                  _id: getDocumentId(set, event.uid),
                  routing: set,
                },
              }, {
                ...formatEvent(event, { formSchema }),
                _build: build,
                _set: set,
              }]);
            } catch (e) {
              counts.errored += 1;
              log('error', 'event %s could not be formatted', event.uid, e);
              return bulkOperations;
            }
          }, []),
        }).then(({ body }) => body);

        if (r.errors) {
          log('error', r.items.map(i => i.index.error));
          throw new Error('bulk index failed');
        }

        counts.created += r.items.filter(i => i.index.result === 'created').length;
        counts.updated += r.items.filter(i => i.index.result === 'updated').length;
      }

      if (nextLastId === -1) {
        hasMore = false;
      } else {
        lastId = nextLastId;
      }
    } while (hasMore);

    operations.push(`indexed ${counts.updated + counts.created} events, ${counts.updated} updated, ${counts.created} created, ${counts.errored} errored`);
  } catch (e) {
    log('error', e);
    error = e;
    operations.push('bulk operations failed');
  }

  await client.indices.refresh({ index });

  counts.deleted = await client.deleteByQuery({
    index,
    refresh: true,
    body: {
      query: {
        bool: {
          must_not: {
            term: {
              _build: build,
            },
          },
          filter: {
            term: {
              _set: set,
            },
          },
        },
      },
    },
  }).then(r => r.body.deleted);

  operations.push(`deleted ${counts.deleted} events from previous builds`);

  return {
    operations,
    counts,
    error,
  };
};

'use strict';

const _ = require('lodash');
const crypto = require('crypto');
const getIndexName = require('./utils/getIndexName');
const getDocumentId = require('./utils/getDocumentId');
const formatEvent = require('./utils/formatEvent');
const log = require('@openagenda/logs')('rebuild');

const limit = 10;

const mapping = require('./service/index/mapping.json');

module.exports = async (config, set, options = {}) => {
  log('called');
  const operations = [];
  let hasMore = true;
  let lastId = 0;
  let error = null;

  const {
    client,
    defaultIndex
  } = config;

  const {
    eventsList,
    formSchema,
    on
  } = {
    eventsList: null,
    formSchema: null,
    on: {
      bulk: () => {},
      error: () => {}
    },
    ...options
  };

  const index = getIndexName(set, defaultIndex);

  if (!await client.indices.exists({ index }).then(r => r.body)) {
    log('creating index', index);
    await client.indices.create({
      index,
      body: {
        mappings: {
          dynamic: false,
          properties: mapping
        }
      }
    });
    operations.push(`index created: ${index}`);
  }

  const build = crypto.randomBytes(16).toString('hex');
  operations.push(`generated unique build id: ${build}`);

  const counts = {
    created: 0,
    updated: 0,
    deleted: 0
  };

  try {
    do {
      const {
        lastId: nextLastId,
        events
      } = await eventsList(lastId, limit);

      log('bulk indexing %s events from %s', events.length, lastId);

      if (events.length) {
        const r = await client.bulk({
          index,
          body: events.reduce((bulkOperations, event) => bulkOperations.concat([
            { index: { _id: getDocumentId(set, event.uid) } },
            { ...formatEvent(event, formSchema),
              _build: build,
              _set: set
            }
          ]), [])
        }).then(r => r.body);

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

    operations.push(`indexed ${counts.updated + counts.created} events, ${counts.updated} updated, ${counts.created} created`);
  } catch (e) {
    log('error', e);
    error = e;
    operations.push(`bulk operations failed`);
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
              _build: build
            }
          },
          filter: {
            term: {
              _set: set
            }
          }
        }
      }
    }
  }).then(r => r.body.deleted);

  operations.push(`deleted ${counts.deleted} events from previous builds`);

  return {
    operations,
    counts,
    error
  }
}

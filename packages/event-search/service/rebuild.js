"use strict";

const h = require('./helpers');
const _ = require('lodash');
const preParse = require('./index/preParse');
const parseExtension = require('./extensions/parse');
const log = require('@openagenda/logs' )('rebuild');

const limit = 10;

const defaultExtensions = {
  contributor: require('./extensions/contributor.fields.js'),
}

const indexSettings = require('./index/settings.json');

module.exports = async (config, alias, options = {}) => {
  const {
    client,
    type
  } = config;

  const params = Object.assign({
    eventsList: null,
    extensions: {},
    expire: false
  }, options);

  Object.assign(params.extensions, defaultExtensions);

  const extendedSettings = h.extendMapping( indexSettings, _.mapValues( params.extensions, parseExtension ) );
  const counts = { indexed: 0 };

  let lastId = 0;
  let hasMore = true;
  // Prepare: check list func and create new index

  await h.checkList(params.eventsList);

  const index = await h.createUniqueIndex(client, alias, extendedSettings);

  // Populate: use list func to populate new index

  log('start populating new index');

  try {
    do {
      const {
        lastId: nextLastId,
        events
      } = await params.eventsList(lastId, limit);

      hasMore = !!events.length && (nextLastId !== -1);

      log('bulk indexing from lastId %s %s events (total of %d timings)', lastId, events.length, events.reduce((t, e) => t + _.get(e, 'timings', []).length, 0));

      const bulkJob = h.indexBulk(client, index, type, events.map(e => preParse(e)), { expire: params.expire });

      if (!bulkJob) {
        log('nothing to index in bulk job: all items were filtered out');
        lastId = nextLastId;
        continue;
      }

      const bulkResult = await bulkJob;

      if (bulkResult.errors) {
        log('error', 'bulk index returned errors', bulkResult);
      } else {
        counts.indexed += bulkResult.items.length;
        log('info', 'bulk indexed lastId %s on index %s, took %s', lastId, index, (bulkResult.took / 1000) + 's');
      }

      lastId = nextLastId;
    } while (hasMore);
  } catch (e) {
    log('error', 'index rebuild failed - deleting, not reassigning', e);

    await client.indices.delete({ index });

    throw e;
  }

  log('info', 'reassign alias, %s, remove previous indices, refresh new index', alias);

  // Wrap up: re-assign alias, remove previous indices, refresh new index

  let previousIndices = [];

  if (await client.indices.existsAlias({ name: alias })) {
    previousIndices = Object.keys(await client.indices.getAlias({ name: alias }));
  }

  await client.indices.putAlias({
    index,
    name: alias
  });

  while (previousIndices.length) {
    await client.indices.delete({
      index: previousIndices.pop()
    });
  }

  log('info', 'updated alias %s, removed %s previously associated indices', alias, previousIndices.length);

  await client.indices.refresh({ index });

  return {
    success: true,
    counts,
    detail: {
      index
    }
  }

}

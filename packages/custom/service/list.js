import logs from '@openagenda/logs';
import config from './config.js';
import listQuery from './validators/listQuery.js';

const log = logs('list');

function _base(formSchemaId, query = {}) {
  if (!config.knex) throw new Error('db connector needs to be specified at service init');

  const cleanQuery = listQuery(query);
  log('cleaned query: %j', cleanQuery);

  const k = config
    .knex(config.schemas.custom)
    .where('form_schema_id', formSchemaId);

  if (cleanQuery.identifier) {
    k.where('identifier', 'in', cleanQuery.identifier);
  }

  return k;
}

export default async (formSchemaId, query = {}, offset = 0, limit = 20) => {
  log('listing data form schema %s with query %j', formSchemaId, query);
  return {
    items: (
      await _base(formSchemaId, query)
        .select(['id', 'identifier', 'store'])
        .orderBy('id')
        .limit(limit)
        .offset(offset)
    ).map((r) => {
      let store = {};

      try {
        store = JSON.parse(r.store);
      } catch (e) {
        log('error', 'failed to parse store of entry %s', r.id);
      }

      return {
        identifier: r.identifier,
        custom: store,
      };
    }),
    total: await _base(formSchemaId, query)
      .count('identifier as total')
      .then((r) => r[0].total),
  };
};

"use strict";

const config = require('./config');

const listQuery = require('./validators/listQuery');

function _base(formSchemaId, query = {}) {
  if (!config.knex) throw new Error('db connector needs to be specified at service init');

  const cleanQuery = listQuery(query);

  const k = config.knex(config.schemas.custom).where('form_schema_id', formSchemaId);

  if (cleanQuery.identifier) {
    k.where('identifier', 'in', cleanQuery.identifier);
  }

  return k;
}

module.exports = async (formSchemaId, query = {}, offset = 0, limit = 20) => {
  return {
    items: (
      await _base(formSchemaId, query).select(['identifier', 'store']).limit(limit).offset(offset)
    ).map(r => ({
      identifier: r.identifier,
      custom: JSON.parse(r.store)
    })),
    total: await _base(formSchemaId, query).count('identifier as total').then(r => r[ 0 ].total)
  }
}

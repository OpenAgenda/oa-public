'use strict';

const _ = require('lodash');
const VError = require('@openagenda/verror');
const validate = require('./validate');

async function _fetchUnusedUid(knex, schema, attempt = 0) {
  if (attempt > 1000) throw new VError('Failed to find available network uid');

  const uid = Math.floor(Math.random() * 100000000);

  return knex(schema)
    .first('id')
    .where('uid', uid)
    .then((ref) => (ref ? _fetchUnusedUid(knex, schema, attempt + 1) : uid));
}

module.exports = async ({ knex, schema }, data) => {
  const clean = _.assign(validate.part(['title'], data), {
    uid: await _fetchUnusedUid(knex, schema),
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  await knex(schema).insert(_.mapKeys(clean, (v, k) => _.snakeCase(k)));

  return clean;
};

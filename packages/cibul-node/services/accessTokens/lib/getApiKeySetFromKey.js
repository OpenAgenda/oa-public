'use strict';

module.exports = (knex, keyField, keyString) => {
  if (!keyString) {
    throw new Error('key is required');
  }

  return knex('api_key_set')
    .first(['id', 'user_id']).where({
      [keyField]: keyString
    });
}

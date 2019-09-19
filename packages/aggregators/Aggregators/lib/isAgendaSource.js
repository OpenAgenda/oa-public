'use strict';

module.exports = async (knex, { id }) => {
  return knex('aggregator_source')
    .first(['id'])
    .where({review_id: id})
    .then(r => !!r);
}

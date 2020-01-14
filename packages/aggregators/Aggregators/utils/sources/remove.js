'use strict';

const getAggregator = require('../getAggregator');

module.exports = async (knex, aggregatorAgenda, sourceAgenda) => {
  const aggregator = await getAggregator(knex, aggregatorAgenda);

  if (!aggregator) {
    throw new Error('Aggregator not found');
  }

  return knex('aggregator_source').delete().where({
    review_id: sourceAgenda.id,
    aggregator_id: aggregator.id
  });
}

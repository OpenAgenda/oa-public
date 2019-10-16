'use strict';

const getAggregator = require('../getAggregator');

module.exports = async (knex, aggregatorAgenda, sourceAgenda, sourceRules = []) => {
  const aggregator = await getAggregator(knex, aggregatorAgenda);

  if (!aggregator) {
    throw new Error('Aggregator not found');
  }

  const insertIds = await knex('aggregator_source').insert({
    review_id: sourceAgenda.id,
    aggregator_id: aggregator.id,
    store: JSON.stringify(sourceRules),
    created_at: new Date(),
    updated_at: new Date()
  });

  return {
    aggregator,
    source: {
      id: insertIds[0],
      rules: sourceRules
    }
  }
}

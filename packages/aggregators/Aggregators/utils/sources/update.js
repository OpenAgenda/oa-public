'use strict';

const getAggregator = require('../getAggregator');

module.exports = async (knex, aggregatorAgenda, sourceAgenda, sourceRules = []) => {
  const aggregator = await getAggregator(knex, aggregatorAgenda);

  if (!aggregator) {
    throw new Error('Aggregator not found');
  }

  await knex('aggregator_source').update({
    store: JSON.stringify(sourceRules),
    updated_at: new Date()
  }).where({
    review_id: sourceAgenda.id,
    aggregator_id: aggregator.id
  });

  return {
    aggregator,
    source: {
      id: sourceId,
      rules: sourceRules
    }
  }
}

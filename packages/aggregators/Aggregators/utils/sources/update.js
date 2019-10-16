'use strict';

const getAggregator = require('../getAggregator');

module.exports = async (knex, sourceId, sourceRules = []) => {
  const aggregator = await getAggregator(knex, aggregatorAgenda);

  if (!aggregator) {
    throw new Error('Aggregator not found');
  }

  await knex('aggregator_source').update({
    store: JSON.stringify(sourceRules),
    updated_at: new Date()
  }).where('id', sourceId);

  return {
    aggregator,
    source: {
      id: sourceId,
      rules: sourceRules
    }
  }
}

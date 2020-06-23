'use strict';

const getAggregator = require('../getAggregator');
const cleanRule = require('../rules/clean');

module.exports = async (
  knex,
  aggregatorAgenda,
  sourceAgenda,
  sourceRules = []
) => {
  const aggregator = await getAggregator(knex, aggregatorAgenda);

  if (!aggregator) {
    throw new Error('Aggregator not found');
  }

  const cleanSourceRules = sourceRules.map(r => cleanRule(r));

  const insertIds = await knex('aggregator_source').insert({
    review_id: sourceAgenda.id,
    aggregator_id: aggregator.id,
    store: JSON.stringify({
      rules: cleanSourceRules
    }),
    created_at: new Date(),
    updated_at: new Date()
  });

  return {
    aggregator,
    source: {
      id: insertIds[0],
      rules: cleanSourceRules
    }
  };
};

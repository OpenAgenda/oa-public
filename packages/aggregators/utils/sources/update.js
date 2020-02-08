'use strict';

const getAggregator = require('../getAggregator');

module.exports = async (knex, aggregatorAgenda, source, sourceRules = []) => {
  const aggregator = await getAggregator(knex, aggregatorAgenda);

  if (!aggregator) {
    throw new Error('Aggregator not found');
  }

  await knex('aggregator_source').update({
    store: JSON.stringify({ rules: sourceRules }),
    updated_at: new Date()
  }).where({
    review_id: source.agenda.id,
    aggregator_id: aggregator.id
  });

  return {
    aggregator,
    source: {
      id: source.id,
      rules: sourceRules
    }
  }
}

'use strict';

const extractRules = require('./extractRules');
const log = require('@openagenda/logs')('addSource');

module.exports.add = async (knex, aggregatorAgenda, sourceAgenda, sourceRules = []) => {
  const aggregator = await _getAggregator(knex, aggregatorAgenda);

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

module.exports.remove = async(knex, aggregatorAgenda, sourceAgenda) => {
  const aggregator = await _getAggregator(knex, aggregatorAgenda);

  if (!aggregator) {
    throw new Error('Aggregator not found');
  }

  return knex('aggregator_source').delete().where({
    review_id: sourceAgenda.id,
    aggregator_id: aggregator.id
  });
}

function _getAggregator(knex, aggregatorAgenda) {
  return knex('aggregator').first(['id', 'store'])
    .where('review_id', aggregatorAgenda.id)
    .then(agg => agg ? ({
      id: agg.id,
      rules: extractRules('aggregator', agg.id, agg.store)
    }) : null);
}

'use strict';

const getAggregator = require('./getAggregator');

module.exports = async (knex, agenda, aggregatorAgenda = null) => {
  const query = knex('aggregator_source')
    .first(['id'])
    .where({review_id: agenda.id});

  if (aggregatorAgenda) {
    const aggregatorId = await getAggregator(knex, aggregatorAgenda, true);

    if (aggregatorId) {
      query.where('aggregator_id', aggregatorId);
    }
  }

  return query.then(r => r ? r.id : null);
}

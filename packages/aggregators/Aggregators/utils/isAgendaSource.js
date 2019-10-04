'use strict';

module.exports = async (knex, agenda, aggregatorAgenda = null) => {
  const query = knex('aggregator_source')
    .first(['id'])
    .where({review_id: agenda.id});

  if (aggregatorAgenda) {
    const aggregatorId = await knex('aggregator')
      .first(['id'])
      .where('review_id', aggregatorAgenda.id)
      .then(agg => agg ? agg.id : null);

    if (aggregatorId) {
      query.where('aggregator_id', aggregatorId);
    }
  }

  return query.then(r => !!r);
}

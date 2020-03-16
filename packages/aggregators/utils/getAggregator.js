'use strict';

const extractRules = require('./rules/extract');

module.exports = (knex, agenda, idOnly = false) => knex('aggregator')
  .first(idOnly ? ['id'] : ['id', 'store', 'limit'])
  .where('review_id', agenda.id)
  .then(agg => {
    if (agg && idOnly) {
      return agg.id;
    }

    if (agg) {
      return {
        id: agg.id,
        rules: extractRules('aggregator', agg.id, agg.store),
        limit: agg.limit
      };
    }

    return null;
  });

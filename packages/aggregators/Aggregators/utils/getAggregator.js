'use strict';

const extractRules = require('./extractRules');

module.exports = (knex, agenda, idOnly = false) => knex('aggregator')
  .first(idOnly ? ['id'] : ['id', 'store'])
  .where('review_id', agenda.id)
  .then(agg => agg && idOnly ? agg.id : (agg ? ({
    id: agg.id,
    rules: extractRules('aggregator', agg.id, agg.store)
  }) : null));

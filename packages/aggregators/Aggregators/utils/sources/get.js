'use strict';

const _ = require('lodash');

const validateListQuery = require('../validateListQuery');
const extractRules = require('../extractRules');

module.exports = async ({
  knex,
  getAgendasByUidsAndSearch
}, sourceId, options = {}) => {
  const {
    detailed
  } = {
    detailed: false,
    ...options
  };

  const source = await knex('aggregator_source as ags')
    .first([
      'ags.id as sourceId',
      'r.uid as agendaUid',
      'ags.store as sourceStore',
      'ags.aggregator_id as aggregatorId'
    ]).leftJoin('review as r', 'ags.review_id', 'r.id')
    .where('ags.id', sourceId)
    .then(row => ({
      id: row.sourceId,
      agendaUid: row.agendaUid,
      rules: extractRules('sourceStore', row.sourceId, row.sourceStore),
      aggregatorId: row.aggregatorId
    }));

  if (detailed && source) {
    source.agenda = _.first(await getAgendasByUidsAndSearch(source.agendaUid));
  };

  return source;
}

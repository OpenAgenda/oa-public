'use strict';

const extractRules = require('./rules/extract');

module.exports = (knex, { id }) => knex('aggregator as ag')
  .select([
    'r.uid as agendaUid',
    'ags.id as sourceId',
    'ags.store as sourceStore',
    'ag.id as aggregatorId',
    'ag.store as aggStore'
  ])
  .leftJoin('aggregator_source as ags', 'ag.id', 'ags.aggregator_id')
  .leftJoin('review as r', 'ag.review_id', 'r.id')
  .where('ags.review_id', id)
// .where('version', 2) -> not required as v1 is discontinued
  .then(pairs => pairs.map(p => ({
    agendaUid: p.agendaUid,
    aggregatorRules: extractRules('aggregator', p.aggregatorId, p.aggStore),
    sourceRules: extractRules('source', p.sourceId, p.sourceStore)
  })));

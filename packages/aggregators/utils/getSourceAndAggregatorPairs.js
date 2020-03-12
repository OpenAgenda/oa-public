'use strict';

const extractRules = require('./rules/extract');

module.exports = (knex, { id }) => knex('aggregator as ag')
  .select([
    'r.uid as agendaUid',
    'ags.id as sourceId',
    'ags.store as sourceStore',
    'ag.id as aggregatorId',
    'ag.store as aggStore',
    'ag.limit as aggLimit'
  ])
  .leftJoin('aggregator_source as ags', 'ag.id', 'ags.aggregator_id')
  .leftJoin('review as r', 'ag.review_id', 'r.id')
  .where('ags.review_id', id)
  .then(pairs => pairs.map(p => ({
    agendaUid: p.agendaUid,
    limit: p.aggLimit,
    aggregatorRules: extractRules('aggregator', p.aggregatorId, p.aggStore),
    sourceRules: extractRules('source', p.sourceId, p.sourceStore)
  })));

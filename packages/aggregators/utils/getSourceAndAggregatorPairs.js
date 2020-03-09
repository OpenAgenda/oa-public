'use strict';

const extractRules = require('./rules/extract');
const log = require('@openagenda/logs')('getSourceAndAggregatorPairs');

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
  .andWhere(
    builder => builder
      .whereNull('ag.deactivated_until')
      .orWhere('ag.deactivated_until', '<', new Date(new Date().setHours(0, 0, 0, 0)))
  )
  // .where('version', 2) -> not required as v1 is discontinued
  .then(pairs => pairs.map(p => ({
    agendaUid: p.agendaUid,
    aggregatorRules: extractRules('aggregator', p.aggregatorId, p.aggStore),
    sourceRules: extractRules('source', p.sourceId, p.sourceStore)
  })));

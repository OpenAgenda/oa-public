'use strict';

const log = require('@openagenda/logs')('getSourceAndAggregatorPairs');

module.exports = (knex, { id }) => knex('aggregator as ag')
  .select([
    'r.uid as agendaUid',
    'ags.id as sourceId',
    'ags.store as sourceStore',
    'ag.id as aggregatorId',
    'ag.store as aggStore'
  ]).leftJoin('aggregator_source as ags', 'ag.id', 'ags.aggregator_id')
    .leftJoin('review as r', 'ag.review_id', 'r.id')
    .where('ags.review_id', id)
    .where('version', 2)
    .then(pairs => pairs.map(p => ({
      agendaUid: p.agendaUid,
      aggregatorRules: _extractRules('aggregator', p.aggregatorId, p.aggStore),
      sourceRules: _extractRules('source', p.sourceId, p.sourceStore),
      version: _version(p.aggStore)
    })));

function _version(store) {
  try {
    const { version } = JSON.parse(store);
    return version || 1;
  } catch(e) {
    log('error', 'failed to parse store');
  }
  return 1;
}

function _extractRules(type, identifier, store) {
  if (!store) return [];

  try {
    const { rules } = JSON.parse(store);
    return rules;
  } catch(e) {
    log('error', 'failed to parse %s store (%s)', type, identifier, e);
  }
}

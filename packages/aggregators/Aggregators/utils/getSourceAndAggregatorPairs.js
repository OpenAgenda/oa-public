'use strict';

const extractRules = require('./extractRules');
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
      aggregatorRules: extractRules('aggregator', p.aggregatorId, p.aggStore),
      sourceRules: extractRules('source', p.sourceId, p.sourceStore),
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



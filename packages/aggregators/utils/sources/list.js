'use strict';

const _ = require('lodash');
const log = require('@openagenda/logs')('sources/list');

const getAggregator = require('../getAggregator');
const validateListQuery = require('../validateListQuery');
const extractRules = require('../rules/extract');

module.exports = async (
  { knex, getAgendasByUids },
  aggregatorAgenda,
  query = {},
  options = {}
) => {
  log('received with %j', query);
  const aggregatorId = await getAggregator(knex, aggregatorAgenda, true);

  if (!aggregatorId) throw new Error('Aggregator not found');

  const { detailed } = {
    detailed: false,
    ...options,
  };

  const cleanQuery = validateListQuery(
    typeof query === 'string' ? { search: query } : query
  );

  const sources = await knex('aggregator_source as ags')
    .select([
      'ags.id as sourceId',
      'r.uid as agendaUid',
      'ags.store as sourceStore',
    ])
    .leftJoin('review as r', 'ags.review_id', 'r.id')
    .where('ags.aggregator_id', aggregatorId)
    .then(rows => rows.map(r => ({
      id: r.sourceId,
      agendaUid: r.agendaUid,
      rules: extractRules('sourceStore', r.sourceId, r.sourceStore),
    })));

  if ((detailed || cleanQuery.search || cleanQuery.slug) && sources.length) {
    const agendas = await getAgendasByUids(
      sources.map(s => s.agendaUid),
      cleanQuery
    );

    sources.forEach(s => {
      s.agenda = _.find(agendas, { uid: s.agendaUid });
    });

    return sources.filter(s => !!s.agenda);
  }

  return sources;
};

'use strict';

const _ = require('lodash');
const log = require('@openagenda/logs')('sources/list');

const getAggregator = require('../getAggregator');
const validateListQuery = require('../validateListQuery');
const validateListNav = require('../validateListNav');
const extractRules = require('../rules/extract');

module.exports = async (
  { knex, getAgendasByUids },
  aggregatorAgenda,
  query = {},
  nav = {},
  options = {},
) => {
  log('received with', { query, nav, options });
  const aggregatorId = await getAggregator(knex, aggregatorAgenda, true);

  if (!aggregatorId) {
    log('Aggregator not found');
    throw new Error('Aggregator not found');
  }

  const { detailed } = {
    detailed: false,
    ...options,
  };

  const cleanQuery = validateListQuery(
    typeof query === 'string' ? { search: query } : query,
  );

  const { size, after } = validateListNav(nav);

  const sources = await knex('aggregator_source as ags')
    .select([
      'ags.id as sourceId',
      'r.uid as agendaUid',
      'ags.store as sourceStore',
    ])
    .leftJoin('review as r', 'ags.review_id', 'r.id')
    .where('ags.aggregator_id', aggregatorId)
    .limit(size)
    .where('ags.id', '>', after)
    .then(rows =>
      rows.map(r => ({
        id: r.sourceId,
        agendaUid: r.agendaUid,
        rules: extractRules('sourceStore', r.sourceId, r.sourceStore),
      })));

  if ((detailed || cleanQuery.search || cleanQuery.slug) && sources.length) {
    const agendas = await getAgendasByUids(
      sources.map(s => s.agendaUid),
      cleanQuery,
    );

    sources.forEach(s => {
      s.agenda = _.find(agendas, { uid: s.agendaUid });
      delete s.agendaUid;
    });

    const filteredSources = sources.filter(s => !!s.agenda);
    if (!filteredSources || filteredSources.length < size) {
      return { sources: filteredSources ?? [], after: null };
    }
    return {
      sources: filteredSources,
      after: filteredSources[filteredSources.length - 1].id,
    };
  }
  sources.forEach(s => {
    s.agenda = { uid: s.agendaUid };
    delete s.agendaUid;
  });
  if (!sources || sources.length < size) {
    return { sources: sources ?? [], after: null };
  }
  return { sources, after: sources[sources.length - 1].id };
};

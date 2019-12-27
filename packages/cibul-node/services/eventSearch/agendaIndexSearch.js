"use strict";

const _ = require('lodash');
const ih = require('immutability-helper');
const getDecorate = require('@openagenda/form-schemas/iso/getDecorate');
const log = require('@openagenda/logs')('services/eventSearch/agendaIndexSearch');
const makeTransform = require('@openagenda/stream-utils').transform;

const getAgendaSearchIndex = require('./lib/getAgendaSearchIndex');
const validateAgendaSearchOptions = require('./lib/validateAgendaSearchOptions');

module.exports = async (eventSearch, agenda, query, nav, options = {}) => {
  const searchIndex = getAgendaSearchIndex(eventSearch, agenda.uid);

  log('agenda %s', agenda.uid);
  const {
    searchOptions,
    parseEvent
  } = await _prepare(agenda, options);

  const {
    events,
    total,
    aggregations
  } = await searchIndex.search(query, nav, searchOptions);

  return {
    total,
    events: events.map(parseEvent),
    aggregations
  };
}

module.exports.moreLikeThis = async (searchIndex, sample, options) => {
  // do it on keywords, title, custom ids, custom text.
  return searchIndex.moreLikeThis(sample, options, {
    date: {
      gte: JSON.stringify(new Date()).split( 'T' )[0],
      timezone: 'Europe/Paris'
    }
  });
}

module.exports.stream = async (searchIndex, agenda, query, options = {}) => {
  const {
    searchOptions,
    parseEvent
  } = await _prepare(agenda, options);

  const stream = searchIndex.search.stream(query, searchOptions);

  return stream.pipe(makeTransform(parseEvent));
}


async function _prepare(agenda, options) {
  const {
    uid: agendaUid,
    schema: agendaSchema
  } = agenda;

  const {
    detailed,
    aggregations,
    monolingual,
    includeCustom,
    private: includePrivate
  } = validateAgendaSearchOptions(options);

  const extensions = ['contributor', 'state', 'featured']
    .concat(includeCustom ? [
      'custom'
    ] : [])
    .concat(includeCustom && includePrivate ? [
      'customModerator', 'customAdministrator'
    ] : []);

  const merge = includeCustom && includePrivate ? {
    custom: ['custom', 'customModerator', 'customAdministrator' ]
  } : undefined;

  const parseEvent = includeCustom ? _loadCustomDataParser(agendaSchema) : e => e;

  return {
    searchOptions: {
      detailed,
      aggregations,
      monolingual,
      extensions,
      merge
    },
    parseEvent
  };
}

function _loadCustomDataParser(agendaSchemaFields) {
  const decorate = getDecorate(agendaSchemaFields);

  return e => e.custom ? ih(e, {
    custom: {
      $set: decorate(e.custom)
    }
  }) : e;
}

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

  return searchIndex.search(query, nav, {
    ...validateAgendaSearchOptions(options),
    formSchema: agenda.schema
  });
}

module.exports.stream = async (searchIndex, agenda, query, options = {}) => {
  const stream = searchIndex.search.stream(query, {
    ...validateAgendaSearchOptions(options),
    formSchema: agenda.schema
  });

  return stream.pipe(makeTransform(parseEvent));
}

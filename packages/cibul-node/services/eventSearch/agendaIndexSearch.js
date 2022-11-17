'use strict';

const log = require('@openagenda/logs')('services/eventSearch/agendaIndexSearch');

const getAgendaSearchIndex = require('./lib/getAgendaSearchIndex');
const validateAgendaSearchOptions = require('./lib/validateAgendaSearchOptions');
const amendRestrictedFieldsWithInternalAccess = require('./lib/amendRestrictedFieldsWithInternalAccess');

module.exports = (eventSearch, agenda) => {
  // loadSummary does not provide schema
  const formSchema = agenda.schema ? amendRestrictedFieldsWithInternalAccess(agenda.schema) : undefined;

  async function search(query, nav, options = {}) {
    const searchIndex = getAgendaSearchIndex(eventSearch, agenda.uid);

    log('agenda %s', agenda.uid);

    return searchIndex.search(query, nav, {
      ...validateAgendaSearchOptions(options),
      formSchema,
    });
  }

  function stream(query, options = {}) {
    const searchIndex = getAgendaSearchIndex(eventSearch, agenda.uid);

    log('agenda %s', agenda.uid);

    return searchIndex.search.stream(query, {
      ...validateAgendaSearchOptions(options),
      formSchema,
    });
  }

  return Object.assign(search, { stream });
};

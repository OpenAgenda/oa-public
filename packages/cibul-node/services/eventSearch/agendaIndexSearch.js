'use strict';

const log = require('@openagenda/logs')('services/eventSearch/agendaIndexSearch');

const getAgendaSearchIndex = require('./lib/getAgendaSearchIndex');
const validateAgendaSearchOptions = require('./lib/validateAgendaSearchOptions');

module.exports = (eventSearch, agenda) => {
  async function search(query, nav, options = {}) {
    const searchIndex = getAgendaSearchIndex(eventSearch, agenda.uid);

    log('agenda %s', agenda.uid);

    return searchIndex.search(query, nav, {
      ...validateAgendaSearchOptions(options),
      formSchema: agenda.schema
    });
  }

  function stream(query, options = {}) {
    const searchIndex = getAgendaSearchIndex(eventSearch, agenda.uid);

    log('agenda %s', agenda.uid);

    return searchIndex.search.stream(query, {
      ...validateAgendaSearchOptions(options),
      formSchema: agenda.schema
    });
  }

  return Object.assign(search, { stream });
};

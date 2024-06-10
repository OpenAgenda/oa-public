import logs from '@openagenda/logs';
import getAgendaSearchIndex from './lib/getAgendaSearchIndex.mjs';
import amendRestrictedFieldsWithInternalAccess from './lib/amendRestrictedFieldsWithInternalAccess.mjs';

const log = logs('services/eventSearch/agendaIndexSearch');

export default (eventSearch, agenda) => {
  // loadSummary does not provide schema
  const formSchema = agenda.schema ? amendRestrictedFieldsWithInternalAccess(agenda.schema) : undefined;

  async function search(query, nav, options = {}) {
    const searchIndex = getAgendaSearchIndex(eventSearch, agenda.uid);

    log('agenda %s', agenda.uid);

    return searchIndex.search(query, nav, {
      ...options,
      formSchema,
    });
  }

  function stream(query, options = {}) {
    const searchIndex = getAgendaSearchIndex(eventSearch, agenda.uid);

    log('agenda %s', agenda.uid, query);

    return searchIndex.search.stream(query, {
      ...options,
      formSchema,
    });
  }

  return Object.assign(search, { stream });
};

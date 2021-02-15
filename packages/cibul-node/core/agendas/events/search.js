'use strict';

const NotFoundError = require('../../utils/NotFoundError');

module.exports = async (core, agendaUid, query, nav, options = {}) => {
  const agenda = await core.agendas(agendaUid).get({
    includeEvent: true,
    access: 'internal',
    private: null
  });

  if (!agenda) {
    throw new NotFoundError('agenda', agendaUid);
  }

  const {
    returnAgenda = false,
    stream = false,
    ...searchOptions
  } = options;

  const search = core.services.eventSearch.agendas(agenda).search;

  const result = stream
    ? search.stream(query, {
      ...searchOptions,
      formSchema: agenda.schema
    })
    : await search(query, nav, {
      ...searchOptions,
      formSchema: agenda.schema
    });

  return returnAgenda
    ? { agenda, result }
    : result;
}

module.exports.rebuild = async (core, agendaUid) => {
  const agenda = await core.agendas(agendaUid).get({
    detailed: true,
    access: 'internal',
    private: null
  });

  if (!agenda) {
    throw new Error('Not found');
  }

  return core.services.eventSearch.agendas(agenda).rebuild();
}

module.exports.resyncEvent = async (core, agendaUid, eventUid, options = {}) => {
  const {
    throwOnError
  } = {
    throwOnError: true,
    ...options
  }
  const eventPayload = await core.agendas(agendaUid).events.get(eventUid, {
    internal: true,
    detailed: true,
    returnPayload: true
  });

  if (!eventPayload && throwOnError) {
    throw new NotFoundError('event', eventUid);
  }

  if (!eventPayload) {
    return;
  }

  return core.services.eventSearch.update(eventPayload)
    .catch(err => {
      if (throwOnError) {
        throw err;
      }
    });
}

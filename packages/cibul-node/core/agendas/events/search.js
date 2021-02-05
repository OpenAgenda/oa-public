'use strict';

const NotFoundError = require('../../utils/NotFoundError');

module.exports = async (core, agendaUid, query, nav, options = {}) => {
  const agenda = await core.agendas(agendaUid).get({
    includeEvent: true,
    access: 'internal',
    private: null
  });

  if (!agenda) {;
    throw new NotFoundError('agenda', agendaUid);
  }

  return core.services.eventSearch.agendas(agenda).search(query, nav, {
    ...options,
    formSchema: agenda.schema
  });
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

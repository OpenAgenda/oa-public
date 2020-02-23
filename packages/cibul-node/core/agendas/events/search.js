'use strict';

module.exports = async (core, agendaUid, query, nav, options = {}) => {
  const agenda = await core.agendas(agendaUid).get({
    includeEvent: true
  });

  if (!agenda) {
    throw new Error('Not found');
  }

  return core.services.eventSearch.agendas(agenda).search(query, nav, options);
}

module.exports.rebuild = async (core, agendaUid) => {
  const agenda = await core.agendas(agendaUid).get({
    detailed: true
  });

  if (!agenda) {
    throw new Error('Not found');
  }

  return core.services.eventSearch.agendas(agenda).rebuild();
}

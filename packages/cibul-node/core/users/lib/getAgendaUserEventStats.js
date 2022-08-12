'use strict';

module.exports = async function getAgendaUserEventStats(core, identifier, agendaUid) {
  const {
    services: {
      events
    }
  } = core;

  // list drafts
  const {
    total: drafts
  } = await events.list({
    ownerUid: identifier,
    agendaUid
  }, { limit: 0 }, { total: true, draft: true });

  // list events
  const states = await core.agendas(agendaUid).events.search({
    state: null,
    ownerUid: identifier
  }, {
    size: 0
  }, {
    aggregations: ['states']
  }).then(({ aggregations }) => aggregations.states);

  return {
    states,
    drafts
  };
};

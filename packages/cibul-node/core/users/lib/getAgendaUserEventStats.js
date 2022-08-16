'use strict';

module.exports = async function getAgendaUserEventStats(core, identifier, agendaUid, options = []) {
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

  const {
    relation = []
  } = options;

  let userFilterKey = 'ownerUid';

  if (relation.includes('contributed') && relation.includes('owned')) {
    userFilterKey = 'ownerOrMemberUid';
  } else if (relation.includes('contributed')) {
    userFilterKey = 'memberUid';
  }

  const userFilter = {
    [userFilterKey]: identifier
  };

  // list events
  const states = await core.agendas(agendaUid).events.search({
    state: null,
    ...userFilter
  }, {
    size: 0
  }, {
    aggregations: ['states'],
    access: 'internal'
  }).then(({ aggregations }) => aggregations.states);

  return {
    states,
    drafts
  };
};

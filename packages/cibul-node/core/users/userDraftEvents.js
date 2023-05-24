'use strict';

module.exports = async function userDraftEvents(core, identifier, agendaUid, query = {}, nav = {}) {
  const {
    services: {
      events,
    },
  } = core;

  return events.list({
    ...query,
    ownerUid: identifier,
    agendaUid,
  }, nav, {
    total: true,
    draft: true,
    useDefaultImage: query.useDefaultImage ?? true,
  });
};

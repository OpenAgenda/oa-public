'use strict';

const {
  NotFound
} = require('@openagenda/verror');

const {
  getForUserOnAgenda: getUserAuthorizationsOnAgenda
} = require('../utils/authorizations');

module.exports = async (core, identifier, agendaUid, eventUid) => {
  const {
    agendaEvents
  } = core.services;

  const ae = await agendaEvents(agendaUid).get(eventUid);

  if (!ae) {
    throw new NotFound('event reference not found');
  }

  const authorizations = await getUserAuthorizationsOnAgenda(core, identifier, agendaUid, eventUid);

  const member = await core.agendas(agendaUid).members.get(identifier, {
    throwOnNotFound: false
  });

  const contributingMember = ae.userUid ? await core.agendas(agendaUid).members.get(ae.userUid) : null;

  return {
    me: {
      authorizations,
      member
    },
    member: contributingMember
  };
};

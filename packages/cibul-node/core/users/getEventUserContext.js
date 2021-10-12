'use strict';

const log = require('@openagenda/verror')('core/users/getEventUserContext');

const {
  NotFound
} = require('@openagenda/verror');

const {
  getForUserOnAgenda: getUserAuthorizationsOnAgenda
} = require('../utils/authorizations');

module.exports = async (core, identifier, agendaUid, eventUid, options = {}) => {
  const {
    agendaEvents
  } = core.services;

  const ae = await agendaEvents(agendaUid).get(eventUid);

  if (!ae) {
    throw new NotFound('event reference not found');
  }

  const authorizations = await getUserAuthorizationsOnAgenda(core, identifier, agendaUid, eventUid);

  const member = await core.agendas(agendaUid).members.get(identifier, {
    ...options,
    throwOnNotFound: false
  });

  const response = {
    me: {
      authorizations,
      member
    }
  };

  try {
    response.member = ae.userUid ? await core.agendas(agendaUid).members.get(ae.userUid, options) : null;
  } catch (e) {
    log('warn', e);
  }

  return response;
};

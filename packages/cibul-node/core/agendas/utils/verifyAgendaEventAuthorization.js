'use strict';

const NotFoundError = require('../../utils/NotFoundError');
const UnauthorizedError = require('../../utils/UnauthorizedError');

module.exports = async (services, agendaUid, eventUid) => {
  const {
    agendaEvents
  } = services;

  const ref = await agendaEvents(agendaUid).get(eventUid);

  if (!ref) {
    throw new NotFoundError('agendaEvent', `${agendaUid}.${eventUid}`);
  }

  if (!ref.canEdit) {
    throw new UnauthorizedError('agendaEvent', `${agendaUid}.${eventUid}`);
  }
}
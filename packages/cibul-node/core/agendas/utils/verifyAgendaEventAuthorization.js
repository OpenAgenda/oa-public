'use strict';

const log = require('@openagenda/logs')('core/agendas/utils/verifyAgendaEventAuthorization');

const NotFoundError = require('../../utils/NotFoundError');
const UnauthorizedError = require('../../utils/UnauthorizedError');

const containsEventData = ({ event }) => !!Object.keys(event).length;

module.exports = async (services, agendaUid, eventUid, data) => {
  const {
    agendaEvents
  } = services;

  const ref = await agendaEvents(agendaUid).get(eventUid);

  if (!ref) {
    throw new NotFoundError('agendaEvent', `${agendaUid}.${eventUid}`);
  }

  if (!containsEventData(data)) {
    return;
  }

  if (!ref.canEdit) {
    throw new UnauthorizedError('agendaEvent', `${agendaUid}.${eventUid}`);
  }
}
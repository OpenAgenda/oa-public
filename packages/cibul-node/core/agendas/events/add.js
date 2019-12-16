"use strict";

const _ = require('lodash');
const VError = require('verror');

const log = require('@openagenda/logs')('core/agendas/events/add');

const doAdd = require('../utils/doAdd');
const createPayload = require('../utils/createPayload');
const loadAgendaAndCleanEvent = require('../utils/loadAgendaAndCleanEvent');

module.exports = async (services, agendaUid, eventUid, data, options = {}) => {
  const {
    agendaEvents,
    events,
    members
  } = services;

  log('adding event %s to agenda %s', eventUid, agendaUid);

  const {
    aggregated,
    sourceAgenda,
    batched,
    context,
    access,
    returnPayload
  } = Object.assign({
    aggregated: false,
    sourceAgenda: null,
    batched: false,
    context: {},
    access: 'public',
    returnPayload: false
  }, options || {});

  const member = context.userUid ? await members.get({
    agendaUid,
    userUid: context.userUid
  }) : null;

  const {
    clean,
    agenda
  } = await loadAgendaAndCleanEvent(services, agendaUid, data, {
    evaluateEvent: false,
    sourceAgenda,
    aggregated,
    member
  });

  const payload = createPayload(services, agenda);

  // if event is already referenced on agenda, this fails
  if (await agendaEvents(agendaUid).get(eventUid)) {
    throw new VError('event %s is already referenced by agenda %s', eventUid, agendaUid);
  }

  const event = await events.get({
    uid: eventUid
  }, {
    internal: true,
    detailed: true
  });

  payload.setItem('event', null, event);

  await doAdd(services, payload, clean, {
    batched,
    aggregated,
    sourceAgenda,
    userUid: member ? member.userUid : null
  });

  const response = await payload.getResponse('added', access);

  return returnPayload ? response : response.added;
}

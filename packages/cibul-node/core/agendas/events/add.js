'use strict';

const _ = require('lodash');
const VError = require('verror');

const log = require('@openagenda/logs')('core/agendas/events/add');

const doAdd = require('../utils/doAdd');
const createPayload = require('../utils/createPayload');

const {
  loadAgenda,
  cleanEvent
} = require('../utils/loadAgendaAndCleanEvent');

const determineEventState = require('../utils/determineEventState');

module.exports = async (services, agendaUid, eventUid, data, options = {}) => {
  // when the event is added on aggregation, only additional data is provided
  const {
    agendaEvents,
    events,
    members
  } = services;

  log('adding event %s to agenda %s', eventUid, agendaUid);

  const {
    aggregated,
    paths,
    sourceAgenda,
    batched,
    context,
    access,
    returnPayload,
    bypassAdditionalFieldValidation
  } = Object.assign({
    aggregated: false,
    paths: null,
    sourceAgenda: null,
    batched: false,
    context: {},
    access: 'public',
    returnPayload: false,
    bypassAdditionalFieldValidation: false
  }, options || {});

  const member = context.userUid ? await members.get({
    agendaUid,
    userUid: context.userUid
  }) : null;

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

  const agenda = await loadAgenda(services, agendaUid);

  const clean = await cleanEvent(services, agenda, data, {
    evaluateEvent: false,
    event,
    bypassAdditionalFieldValidation,
    paths,
    aggregated,
    member,
    access,
    state: determineEventState(data, {
      access,
      defaultState: agenda?.settings?.contribution?.defaultState
    })
  });

  const payload = createPayload(services, agenda);

  payload.setItem('event', null, event);

  const response = await doAdd(services, payload, clean, {
    batched,
    aggregated,
    sourceAgenda,
    userUid: member ? member.userUid : null,
    access
  });

  return returnPayload ? response : response.event;
}

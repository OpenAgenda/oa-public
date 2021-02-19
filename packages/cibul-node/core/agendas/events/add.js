'use strict';

const _ = require('lodash');
const VError = require('verror');

const log = require('@openagenda/logs')('core/agendas/events/add');

const doAdd = require('../utils/doAdd');
const createPayload = require('../utils/createPayload');
const loadAuthorizations = require('../../utils/authorizations');

const cleanEvent = require('../utils/cleanEvent');

const getAgenda = require('../utils/getAgenda');

const assignState = require('../utils/assignState');

module.exports = async (core, agendaUid, eventUid, data, options = {}) => {
  const {
    services
  } = core;

  // when the event is added on aggregation, only additional data is provided
  const {
    agendaEvents,
    events,
    members
  } = services;

  log('adding event %s to agenda %s%s', eventUid, agendaUid, options.aggregated ? ' through aggregation' : '');
  const {
    aggregated,
    paths,
    sourceAgenda,
    batched,
    context,
    access,
    returnPayload,
    bypassAdditionalFieldValidation
  } = {
    aggregated: false,
    paths: null,
    sourceAgenda: null,
    batched: false,
    context: {},
    access: 'public',
    returnPayload: false,
    bypassAdditionalFieldValidation: false,
    ...options
  };

  const member = context.userUid ? await members.get({
    agendaUid,
    userUid: context.userUid
  }) : null;
  log(member ? '  loaded member %s' : '  member is unspecified', member?.id);

  // if event is already referenced on agenda, this fails
  if (await agendaEvents(agendaUid).get(eventUid)) {
    throw new VError('event %s is already referenced by agenda %s', eventUid, agendaUid);
  }

  const event = await events.get({
    uid: eventUid
  }, {
    access: 'internal',
    detailed: true,
    throwOnNotFound: true
  });
  log('  loaded event to be added');

  const agenda = await getAgenda(core.services, agendaUid, { detailed: true });

  log('  loaded agenda %s', agenda.slug);

  const clean = await cleanEvent(services, agenda, data, {
    evaluateEvent: false,
    event,
    bypassAdditionalFieldValidation,
    paths,
    aggregated,
    member,
    access
  });
  log('  cleaned associated data');

  const authorizations = await loadAuthorizations(core, 'add', {
    agenda,
    event,
    member,
    access
  });

  assignState(agenda, null, clean, data, { authorizations });

  const payload = createPayload(services, agenda);

  payload.setItem('event', null, event);

  const response = await doAdd(core, payload, clean, {
    batched,
    aggregated,
    sourceAgenda,
    userUid: member ? member.userUid : null,
    access
  });

  return returnPayload ? response : response.event;
}

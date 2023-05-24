'use strict';

const log = require('@openagenda/logs')('core/agendas/events/add');
const { VError, Forbidden } = require('@openagenda/verror');

const doAdd = require('../utils/doAdd');
const createPayload = require('../utils/createPayload');
const loadAuthorizations = require('../../utils/authorizations');

const cleanEvent = require('../utils/cleanEvent');

const getAgenda = require('../utils/getAgenda');
const assignState = require('../utils/assignState');
const extractUserUid = require('../utils/extractUserUid');

const updateEvent = require('./lib/updateEvent');

const { containsEventData } = cleanEvent;

module.exports = async (core, agendaUid, eventUid, data, options = {}) => {
  const {
    services,
  } = core;

  // when the event is added on aggregation, only additional data is provided
  const {
    agendaEvents,
    events,
    members,
  } = services;

  log('adding event %s to agenda %s%s', eventUid, agendaUid, options.aggregated ? ' through aggregation' : '');
  const {
    aggregated,
    paths,
    sourceAgenda,
    batched,
    access,
    returnPayload,
  } = {
    aggregated: null,
    paths: null,
    sourceAgenda: null,
    batched: false,
    context: {},
    access: 'public',
    returnPayload: false,
    ...options,
  };

  const userUid = extractUserUid(data, options);

  const member = userUid ? await members.get({
    agendaUid,
    userUid,
  }) : null;
  log(member ? '  loaded member %s' : '  member is unspecified', member?.id);

  // if event is already referenced on agenda, this fails
  if (await agendaEvents(agendaUid).get(eventUid)) {
    throw new VError('event %s is already referenced by agenda %s', eventUid, agendaUid);
  }

  const event = await events.get({
    uid: eventUid,
  }, {
    access: 'internal',
    detailed: true,
    throwOnNotFound: true,
  });
  log('  loaded event to be added');

  const agenda = await getAgenda(core.services, agendaUid, { detailed: true });

  log('  loaded agenda %s', agenda.slug);

  const clean = await cleanEvent(services, agenda, data, {
    validateWithStoredData: true,
    event,
    paths,
    aggregated,
    member,
    access,
  });
  log('  cleaned associated data');

  const authorizations = await loadAuthorizations(core, 'add', {
    agenda,
    event,
    member,
    access,
  });

  if (!authorizations.canEditEvent && containsEventData(data)) {
    throw new Forbidden({
      info: {
        uid: event.uid,
      },
    }, 'not authorized to edit event');
  }

  assignState(agenda, null, clean, data, { authorizations });

  const payload = createPayload(core, agenda);

  if (containsEventData(data)) {
    await updateEvent(core.services, {
      clean,
      payload,
      agendaUid,
      userUid,
      eventUid,
      event,
    });
  } else {
    payload.setItem('event', null, event);
  }

  const response = await doAdd(core, payload, clean, {
    batched,
    aggregated,
    sourceAgenda,
    userUid: member ? member.userUid : null,
    access,
  });

  return returnPayload ? response : response.event;
};

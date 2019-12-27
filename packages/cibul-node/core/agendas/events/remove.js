"use strict";

const _ = require( 'lodash' );
const VError = require( 'verror' );

const createPayload = require('../utils/createPayload');
const getAgendaWithNetworkAndSchemas = require('../utils/getAgendaWithNetworkAndSchemas');
const merge = require('../utils/merge');
const refreshAgenda = require('../utils/refreshAgenda');

const log = require('@openagenda/logs')('core/agendas/events/remove');

module.exports = async (services, agendaUid, eventUid, options) => {
  log('removing event %s from agenda %s', eventUid, agendaUid, options);

  const {
    agendas,
    agendaEvents,
    aggregators,
    custom,
    events,
    eventSearch,
    formSchemas
  } = services;

  const agenda = await getAgendaWithNetworkAndSchemas(services, agendaUid);

  const contextUserUid = _.get(options, 'context.userUid');

  const {
    access,
    batched,
    returnPayload
  } = {
    batched: false,
    access: 'public',
    returnPayload: false,
    ...(options || {})
  };

  const payload = createPayload(services, agenda);

  const {
    formSchemaId
  } = agenda;

  const removed = {
    event: false,
    agendaEvent: false,
    custom: false
  };

  const event = await events.get({ uid: eventUid }, {
    private: null,
    internal: true
  });

  if (!event) {
    throw new VError('event of uid %s not found', eventUid);
  }

  payload.setItem('event', event);

  const deletion = event.agendaUid === parseInt(agendaUid);

  if (!event.draft) {
    const result = await agendaEvents(agendaUid).remove(eventUid, {
      transferToLegacy: true,
      context: {
        agendaUid,
        userUid: contextUserUid,
        legacy: false,
        deletion,
        batched
      }
    });

    if (result.success) {
      payload.setItem('agendaEvent', result.removed);
    }
  }

  if (formSchemaId && await custom(formSchemaId).get(eventUid)) {
    const result = await custom(formSchemaId).remove(eventUid, {
      transferToLegacy: !event.draft,
      context: {
        agendaUid,
        userUid: contextUserUid,
        legacy: false
      }
    } );

    if (result.success) {
      payload.setItem('custom.agenda', result.removed);
    }
  }

  const remaining = await agendaEvents.list.byEventUid(eventUid);

  log('there are %s remaining agenda references', remaining.total);
  log('agenda %s event origin agenda', event.agendaUid === parseInt(agendaUid) ? 'is' : 'is not');

  if (!remaining.total || deletion) {
    const result = await events.remove({
      uid: eventUid
    }, {
      agendaUid,
      userUid: contextUserUid,
      transferToLegacy: !event.draft
    });
  }

  if (!event.draft) {
    await aggregators.notify('removeEvent', {
      event: merge.event(event, removed.agendaEvent, removed.custom),
      agenda,
      batched
    });
  }

  try {
    await eventSearch.remove({
      event,
      agenda,
      deletion,
      otherAgendaReferences: deletion ? remaining : []
    });
  } catch (e) {
    log('error', 'could not remove event %s.%s from search indices', event.udi);
  }

  await refreshAgenda(agenda.uid);

  const result = await payload.getResponse('removed', access);

  return returnPayload ? result : result.removed;
}

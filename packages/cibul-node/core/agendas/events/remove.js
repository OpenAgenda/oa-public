'use strict';

const _ = require('lodash');
const { Forbidden, NotFound } = require('@openagenda/verror');

const log = require('@openagenda/logs')('core/agendas/events/remove');
const createPayload = require('../utils/createPayload');
const getAgendaWithNetworkAndSchemas = require('../utils/getAgendaWithNetworkAndSchemas');

const merge = require('../utils/merge');
const refreshAgenda = require('../utils/refreshAgenda');

module.exports = async (services, agendaUid, eventUid, options) => {
  log('removing event %s from agenda %s', eventUid, agendaUid);

  const {
    agendaEvents,
    aggregators,
    custom,
    events,
    eventSearch
  } = services;

  const agenda = await getAgendaWithNetworkAndSchemas(services, agendaUid);
  log('  loaded agenda %s', agenda.slug);

  const contextUserUid = _.get(options, 'context.userUid');

  const {
    access,
    batched,
    returnPayload,
    protectFromOriginRemove,
    private: privateOption
  } = {
    batched: false,
    access: 'public',
    returnPayload: false,
    protectFromOriginRemove: false,
    private: false,
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

  const event = await events.get(eventUid, {
    private: null,
    access: 'internal'
  });

  if (!event) {
    log('error', '  event not found');
    throw new NotFound({ info: { uid: eventUid } }, 'event not found');
  }

  const isOriginAgenda = event.agendaUid === parseInt(agendaUid, 10);

  if (isOriginAgenda && protectFromOriginRemove) {
    throw new Forbidden('Cannot remove event from origin in protected mode');
  }

  log('  loaded event to remove');

  payload.setItem('event', event);

  if (isOriginAgenda) {
    log('remove request comes from agenda %s, origin is %s, proceeding with delete', agendaUid, event.agendaUid);
  }

  if (!event.draft) {
    const result = await agendaEvents(agendaUid).remove(eventUid, {
      transferToLegacy: true,
      context: {
        event,
        agenda,
        agendaUid,
        userUid: contextUserUid,
        legacy: false,
        deletion: isOriginAgenda,
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
    });

    if (result.success) {
      payload.setItem('custom.agenda', result.removed);
    }
  }

  const remaining = await agendaEvents.list.byEventUid(eventUid);

  log('  there are %s remaining agenda references', remaining.total);
  log('  agenda %s event origin agenda', isOriginAgenda ? 'is' : 'is not');

  if (!remaining.total || isOriginAgenda) {
    await events.remove(eventUid, {
      context: {
        agendaUid,
        userUid: contextUserUid
      },
      private: privateOption
    });
    log('  removed from event service');
  }

  if (!event.draft && aggregators) {
    try {
      log('  notifying aggregators of removal');
      await aggregators.notify('removeEvent', {
        event: merge.event(event, removed.agendaEvent, removed.custom),
        agenda,
        batched
      });
      log('  aggregators notified of removal');
    } catch (e) {
      log('error', 'failed to notify aggregators', e);
    }
  }

  try {
    await eventSearch.remove({
      event,
      agenda,
      deletion: isOriginAgenda,
      otherAgendaReferences: remaining.items
    });
    log('  removed from search');
  } catch (e) {
    log('error', 'could not remove event %s.%s from search indices', event.uid, e);
  }

  await refreshAgenda(agenda.uid);

  const result = await payload.getResponse('removed', access);

  return returnPayload ? {
    ...result,
    deletion: isOriginAgenda
  } : result.removed;
};

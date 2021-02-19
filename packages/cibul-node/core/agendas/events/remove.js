'use strict';

const _ = require( 'lodash' );
const VError = require( 'verror' );

const createPayload = require('../utils/createPayload');
const getAgendaWithNetworkAndSchemas = require('../utils/getAgendaWithNetworkAndSchemas');

const merge = require('../utils/merge');
const refreshAgenda = require('../utils/refreshAgenda');

const log = require('@openagenda/logs')('core/agendas/events/remove');

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

  const event = await events.get(eventUid, {
    private: null,
    access: 'internal'
  });

  if (!event) {
    log('error', '  event not found');
    throw new VError('event of uid %s not found', eventUid);
  }

  log('  loaded event to remove');

  payload.setItem('event', event);

  const deletion = event.agendaUid === parseInt(agendaUid);

  if (!event.draft) {
    const result = await agendaEvents(agendaUid).remove(eventUid, {
      transferToLegacy: true,
      context: {
        event,
        agenda,
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

  log('  there are %s remaining agenda references', remaining.total);
  log('  agenda %s event origin agenda', event.agendaUid === parseInt(agendaUid) ? 'is' : 'is not');

  if (!remaining.total || deletion) {
    await events.remove(eventUid, {
      context: {
        agendaUid,
        userUid: contextUserUid
      }
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
      deletion,
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
    deletion
  } : result.removed;
}

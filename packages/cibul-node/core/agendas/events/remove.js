import { Forbidden, NotFound } from '@openagenda/verror';
import logs from '@openagenda/logs';
import createPayload from '../utils/createPayload.js';
import getAgenda from '../utils/getAgenda.js';
import loadAuthorizations from '../../utils/authorizations.js';
import * as merge from '../utils/merge.js';
import refreshAgenda from '../utils/refreshAgenda.js';
import Stopwatch from '../utils/Stopwatch.js';
import extractActingFromContext from './lib/extractActingFromContext.js';
import createRemoveActivity from './lib/createRemoveActivity.js';

const log = logs('core/agendas/events/remove');

export default async (core, agendaUid, eventUid, options = {}) => {
  const stopwatch = Stopwatch();

  log('removing event %s from agenda %s', eventUid, agendaUid);

  const { agendaEvents, aggregators, custom, events, eventSearch } = core.services;

  const agenda = await getAgenda(core.services, agendaUid, { detailed: true });
  log('  loaded agenda %s', agenda.slug);

  const { user: actingUser, member: actingMember } = await extractActingFromContext(core.services, agendaUid, options.context);

  stopwatch('agenda');

  const {
    access,
    batched,
    returnPayload,
    protectFromOriginRemove,
    private: privateOption,
  } = {
    degregation: false,
    batched: false,
    access: 'public',
    returnPayload: false,
    protectFromOriginRemove: false,
    private: false,
    ...options,
  };

  const payload = createPayload(core, agenda);

  const { formSchemaId } = agenda;

  const removed = {
    event: false,
    agendaEvent: false,
    custom: false,
  };

  const event = await events.get(eventUid, {
    private: null,
    access: 'internal',
  });

  stopwatch('getEvent');

  if (!event) {
    log('error', '  event not found');
    throw new NotFound({ info: { uid: eventUid } }, 'event not found');
  }

  const isOriginAgenda = event.agendaUid === parseInt(agendaUid, 10);

  if (isOriginAgenda && protectFromOriginRemove) {
    throw new Forbidden('Cannot remove event from origin in protected mode');
  }

  const isDelete = !!isOriginAgenda;

  log('  loaded event to remove');

  payload.setItem('event', event);

  const agendaEvent = event.draft
    ? null
    : await agendaEvents(agenda.uid).get(event.uid, {
      throwOnNotFound: true,
    });

  const { canRemoveEvent, canDeleteEvent } = await loadAuthorizations(
    core,
    'remove',
    {
      agenda,
      agendaEvent,
      member: actingMember,
      event,
      access,
    },
  );

  stopwatch('loadAuthorizations');

  if (isDelete && !canDeleteEvent) {
    throw new Forbidden(
      { info: { uid: event.uid } },
      'not authorized to delete event',
    );
  }

  if (!isDelete && !canRemoveEvent) {
    throw new Forbidden(
      { info: { uid: event.uid } },
      'not authorized to remove event',
    );
  }

  if (isDelete) {
    log(
      'remove request comes from agenda %s, origin is %s, proceeding with %s',
      agendaUid,
      event.agendaUid,
      isDelete ? 'deletion' : 'removal',
    );
  }

  if (!event.draft) {
    log('calling event service to remove event %s', eventUid);
    const result = await agendaEvents(agendaUid).remove(eventUid, {
      context: {
        event,
        agenda,
        agendaUid,
        user: actingUser,
        userUid: actingUser?.uid,
        deletion: isOriginAgenda,
        batched,
      },
    });

    stopwatch('agendaEventsRemove');

    if (result.success) {
      log('  removed from agenda events');
      payload.setItem('agendaEvent', result.removed);
    }
  }

  if (formSchemaId && await custom(formSchemaId).get(eventUid)) {
    const result = await custom(formSchemaId).remove(eventUid, {
      context: {
        agendaUid,
        user: actingUser,
        userUid: actingUser?.uid,
      },
    });

    if (result.success) {
      payload.setItem('custom.agenda', result.removed);
    }
  }

  stopwatch('customRemove');

  const remaining = await agendaEvents.list.byEventUid(eventUid);

  log('  there are %s remaining agenda references', remaining.total);
  log('  agenda %s event origin agenda', isOriginAgenda ? 'is' : 'is not');

  if (!remaining.total || isOriginAgenda) {
    log(
      '  no remaining references or origin agenda, removing from event service',
    );
    await events.remove(eventUid, {
      context: {
        agendaUid,
        user: actingUser,
        userUid: actingUser?.uid,
      },
      private: privateOption,
    });
    log('  removed from event service');
  }

  stopwatch('eventsRemove');

  if (!event.draft && aggregators) {
    try {
      log('  notifying aggregators of removal');
      await aggregators.notify('removeEvent', {
        event: merge.event(event, removed.agendaEvent, removed.custom),
        agenda,
        batched,
      });
      log('  aggregators notified of removal');
    } catch (e) {
      log('error', 'failed to notify aggregators', e);
    }
  }

  if (!event.draft) {
    try {
      await createRemoveActivity(core.services, {
        agenda,
        event,
        agendaEvent,
        actingUser,
        actingMember,
        isDelete,
      });
    } catch (e) {
      log.error('failed to create delete/remove activity and remove feed', e);
    }
  }

  try {
    await eventSearch.remove({
      event,
      agenda,
      deletion: isOriginAgenda,
      otherAgendaReferences: remaining.items,
    });
    log('  removed from search');
  } catch (e) {
    log(
      'error',
      'could not remove event %s.%s from search indices',
      event.uid,
      e,
    );
  }

  stopwatch('eventSearchRemove');

  await refreshAgenda(core.services, agenda.uid);

  const result = await payload.getResponse('removed', access);

  result.times = stopwatch.getTimes();

  return returnPayload
    ? {
      ...result,
      deletion: isOriginAgenda,
    }
    : result.removed;
};

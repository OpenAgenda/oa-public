import { Forbidden, NotFound } from '@openagenda/verror';
import logs from '@openagenda/logs';
import createPayload from '../utils/createPayload.js';
import getAgenda from '../utils/getAgenda.js';
import loadAuthorizations from '../../utils/authorizations.js';
import * as merge from '../utils/merge.js';
import refreshAgenda from '../utils/refreshAgenda.js';

const log = logs('core/agendas/events/remove');

export default async (core, agendaUid, eventUid, options = {}) => {
  log('removing event %s from agenda %s', eventUid, agendaUid);

  const { agendaEvents, aggregators, custom, events, eventSearch, members } = core.services;

  const agenda = await getAgenda(core.services, agendaUid, { detailed: true });
  log('  loaded agenda %s', agenda.slug);

  const actingUser = options?.context?.user;
  const actingUserUid = options.userUid ?? options?.context?.userUid ?? actingUser?.uid;

  const actingMember = actingUserUid
    ? await members.get(
      {
        agendaUid: agenda.uid,
        userUid: actingUserUid,
      },
      { roleAsSlug: false },
    )
    : null;

  const {
    access,
    batched,
    returnPayload,
    protectFromOriginRemove,
    private: privateOption,
  } = {
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

  const { canRemoveEvent, canDeleteEvent } = await loadAuthorizations(
    core,
    'remove',
    {
      agenda,
      agendaEvent: event.draft
        ? null
        : await agendaEvents(agenda.uid).get(event.uid, {
          throwOnNotFound: true,
        }),
      member: actingMember,
      event,
      access,
    },
  );

  if (isOriginAgenda) {
    if (!canDeleteEvent) {
      throw new Forbidden(
        { info: { uid: event.uid } },
        'not authorized to delete event',
      );
    }
    log(
      'remove request comes from agenda %s, origin is %s, proceeding with delete',
      agendaUid,
      event.agendaUid,
    );
  } else if (!canRemoveEvent) {
    throw new Forbidden(
      { info: { uid: event.uid } },
      'not authorized to remove event',
    );
  }

  if (!event.draft) {
    log('calling event service to remove event %s', eventUid);
    const result = await agendaEvents(agendaUid).remove(eventUid, {
      transferToLegacy: true,
      context: {
        event,
        agenda,
        agendaUid,
        user: actingUser,
        userUid: actingUserUid,
        legacy: false,
        deletion: isOriginAgenda,
        batched,
      },
    });

    if (result.success) {
      log('  removed from agenda events');
      payload.setItem('agendaEvent', result.removed);
    }
  }

  if (formSchemaId && await custom(formSchemaId).get(eventUid)) {
    const result = await custom(formSchemaId).remove(eventUid, {
      transferToLegacy: !event.draft,
      context: {
        agendaUid,
        user: actingUser,
        userUid: actingUserUid,
        legacy: false,
      },
    });

    if (result.success) {
      payload.setItem('custom.agenda', result.removed);
    }
  }

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
        userUid: actingUserUid,
      },
      private: privateOption,
    });
    log('  removed from event service');
  }

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

  await refreshAgenda(agenda.uid);

  const result = await payload.getResponse('removed', access);

  return returnPayload
    ? {
      ...result,
      deletion: isOriginAgenda,
    }
    : result.removed;
};

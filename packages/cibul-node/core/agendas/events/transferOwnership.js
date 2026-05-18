import { Forbidden, NotFound } from '@openagenda/verror';
import logs from '@openagenda/logs';
import membersSvc from '@openagenda/members';
import getAgenda from '../utils/getAgenda.js';
import createPayload from '../utils/createPayload.js';
import convertLocationAdditionalFields from '../utils/convertLocationAdditionalFields.js';
import formatError from '../utils/formatError.js';
import extractActingFromContext from './lib/extractActingFromContext.js';
import createTransferOwnershipActivity from './lib/createTransferOwnershipActivity.js';

const log = logs('core/agendas/events/transferOwnership');

const {
  utils: { compareRoles },
} = membersSvc;

export default async function transferOwnership(
  core,
  agendaUid,
  eventUid,
  data,
  options = {},
) {
  const { agendaEvents, events, members } = core.services;

  log('transferring event %s on agenda %s', eventUid, agendaUid);

  const agenda = await getAgenda(core.services, agendaUid, { detailed: true });

  const event = await events.get(eventUid, {
    access: 'internal',
    private: null,
  });

  if (!event) {
    throw new NotFound({ info: { uid: eventUid } }, 'event not found');
  }

  const agendaEvent = await agendaEvents(agendaUid).get(eventUid, {
    throwOnNotFound: true,
  });

  const targetMember = await members.get(
    { agendaUid, userUid: data.userUid },
    { roleAsSlug: false },
  );

  if (!targetMember) {
    throw new NotFound(
      { info: { agendaUid, userUid: data.userUid } },
      'target member not found',
    );
  }

  if (
    !compareRoles.isSuperiorToOrEqual(targetMember.role, 'contributor', {
      throwIfUnknown: false,
    })
  ) {
    throw new Forbidden(
      { info: { agendaUid, userUid: data.userUid } },
      'target cannot edit events',
    );
  }

  const { user: actingUser, member: actingMember } = await extractActingFromContext(core.services, agendaUid, options.context);

  const isAdminOrMod = !!actingMember
    && compareRoles.isSuperiorTo(actingMember.role, 'contributor', {
      throwIfUnknown: false,
    });
  const isCurrentOwner = !!actingMember && actingMember.userUid === event.ownerUid;

  if (!actingMember || (!isAdminOrMod && !isCurrentOwner)) {
    throw new Forbidden(
      { info: { agendaUid, eventUid } },
      'not authorized to transfer ownership',
    );
  }

  if (event.ownerUid === targetMember.userUid) {
    log.info('transferOwnership no-op: target is already the current owner', {
      agendaUid,
      eventUid,
      ownerUid: event.ownerUid,
    });
    return event;
  }

  const previousOwnerUid = event.ownerUid;

  log(
    'transferring ownership of event %s from %s to %s on agenda %s',
    eventUid,
    event.ownerUid,
    targetMember.userUid,
    agendaUid,
  );

  await events.patch(
    { uid: event.uid },
    { ownerUid: targetMember.userUid },
    { protected: false, access: 'internal' },
  );

  await agendaEvents(agendaUid).update(
    event.uid,
    { userUid: targetMember.userUid },
    {
      protected: false,
      context: {
        userUid: actingMember?.userUid,
        member: actingMember,
      },
    },
  );

  log.info('transferred event ownership', {
    agendaUid,
    eventUid,
    fromUserUid: previousOwnerUid,
    toUserUid: targetMember.userUid,
    actingUserUid: actingMember?.userUid,
  });

  const refreshedEvent = await events.get(eventUid, {
    access: 'internal',
    private: null,
  });
  const refreshedAgendaEvent = await agendaEvents(agendaUid).get(eventUid);

  try {
    await createTransferOwnershipActivity(core.services, {
      agenda,
      event: refreshedEvent,
      previousOwnerUid,
      newOwnerUid: targetMember.userUid,
      actingUser,
      actingMember,
    });
  } catch (e) {
    log('error', 'failed to write transferOwnership activity', { error: e });
  }

  const { activities } = core.services;

  if (activities) {
    if (previousOwnerUid && previousOwnerUid !== targetMember.userUid) {
      try {
        await activities
          .feed({ entityType: 'user', entityUid: previousOwnerUid })
          .unfollow({ entityType: 'event', entityUid: event.uid });
      } catch (e) {
        log('error', 'failed to update previous owner feed', { error: e });
      }
    }

    try {
      await activities
        .feed({ entityType: 'user', entityUid: targetMember.userUid })
        .follow({ entityType: 'event', entityUid: event.uid });
    } catch (e) {
      log('error', 'failed to update new owner feed', { error: e });
    }
  }

  const payload = createPayload(core, agenda);
  payload.setItem('event', event, refreshedEvent);
  payload.setItem('agendaEvent', agendaEvent, refreshedAgendaEvent);

  try {
    const formSchema = await payload.getFormSchema({ access: 'internal' });
    const response = await payload.getResponse('event', {
      access: 'internal',
      load: { valid: true },
    });
    const fullEventAfter = await payload.getCompiledEvent('after', null, null, {
      valid: true,
    });

    await core.services.eventSearch.update({
      ...response,
      formSchema,
      event: fullEventAfter.location
        ? convertLocationAdditionalFields(formSchema, fullEventAfter)
        : fullEventAfter,
    });
  } catch (e) {
    log(
      'error',
      'could not update search indices for event %s.%s: %s',
      agendaUid,
      eventUid,
      formatError(e),
    );
  }

  return refreshedEvent;
}

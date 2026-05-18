import { Forbidden, NotFound } from '@openagenda/verror';
import logs from '@openagenda/logs';
import membersSvc from '@openagenda/members';
import getAgenda from '../utils/getAgenda.js';
import extractActingFromContext from './lib/extractActingFromContext.js';

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

  const agenda = await getAgenda(core.services, agendaUid, { detailed: true }); // eslint-disable-line no-unused-vars -- used by later tasks

  const event = await events.get(eventUid, {
    access: 'internal',
    private: null,
  });

  if (!event) {
    throw new NotFound({ info: { uid: eventUid } }, 'event not found');
  }

  // eslint-disable-next-line no-unused-vars -- used by later tasks
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

  const { member: actingMember } = await extractActingFromContext(
    core.services,
    agendaUid,
    options.context,
  );

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
    fromUserUid: event.ownerUid,
    toUserUid: targetMember.userUid,
    actingUserUid: actingMember?.userUid,
  });

  return event;
}

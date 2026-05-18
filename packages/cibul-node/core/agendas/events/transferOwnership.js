import { Forbidden, NotFound } from '@openagenda/verror';
import logs from '@openagenda/logs';
import membersSvc from '@openagenda/members';
import getAgenda from '../utils/getAgenda.js';

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

  log('after checks', {
    agenda: agenda?.uid,
    agendaEvent: agendaEvent?.eventUid,
    targetMember: targetMember?.userUid,
    data,
    options,
  });

  throw new Error('not implemented');
}

import logs from '@openagenda/logs';

import getAgenda from '../utils/getAgenda.js';

const log = logs('core/agendas/members/sendGroupMail');

export default async function sendGroupMail(
  core,
  agendaUid,
  memberOrUid,
  query,
  data,
  options = {},
) {
  log('processing', { memberOrUid, agendaUid });
  const {
    services: { members },
  } = core;

  const agenda = await getAgenda(core.services, agendaUid, { detailed: true });

  const member = typeof memberOrUid === 'number'
    ? await members.get(
      {
        agendaUid,
        userUid: memberOrUid,
      },
      { detailed: true },
    )
    : memberOrUid;

  if (!member.user) {
    member.user = options.user || await core.users.get(member.userUid);
  }

  log('sending', { member, query, data, options });

  return members.sendGroupMail(agenda, member, query, data, {
    lang: options.lang,
  });
}

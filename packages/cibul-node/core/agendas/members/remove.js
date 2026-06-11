import { Forbidden, BadRequest, Conflict } from '@openagenda/verror';
import canEdit from './lib/canEdit.js';
import isLastAdministrator from './lib/isLastAdministrator.js';

export default async (core, agendaOrUid, identifiers, options = {}) => {
  const { services } = core;
  const { members, users, custom, agendas } = services;

  const { userUid: actingUserUid, silent } = options;

  if (!actingUserUid) {
    throw new BadRequest('userUid option is required');
  }

  const agendaUid = agendaOrUid?.constructor.name === 'Object' ? agendaOrUid.uid : agendaOrUid;

  const member = await members.get(
    {
      agendaUid,
      ...identifiers,
    },
    { throwOnNotFound: true },
  );

  const actingMember = await members.get({
    agendaUid,
    userUid: actingUserUid,
  });

  const actingUser = await users.findOne({ query: { uid: actingUserUid } });

  if (
    !canEdit(services, {
      acting: actingMember,
      userUid: member.userUid,
    })
  ) {
    throw new Forbidden('Not authorized to patch member');
  }

  if (await isLastAdministrator(services, { agendaUid, member })) {
    throw new Conflict(
      { info: { code: 'last-administrator' } },
      'Cannot remove the last administrator of the agenda',
    );
  }

  const memberRes = await members.remove(member.id, {
    context: {
      user: actingUser,
      silent,
    },
  });

  const agenda = agendaOrUid?.constructor.name === 'Object'
    ? agendaOrUid
    : await agendas.get({ uid: agendaUid });

  if (!agenda.memberSchemaId) {
    return memberRes;
  }

  const customRes = await custom(agenda.memberSchemaId).remove(member.userUid);
  return { ...memberRes, ...customRes };
};

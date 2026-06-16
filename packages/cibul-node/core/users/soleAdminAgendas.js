import { NotFound } from '@openagenda/verror';
import countAdministrators from '../agendas/members/lib/countAdministrators.js';
import validateIdentifier from './lib/validateIdentifier.js';

/**
 * Lists the agendas where the user is the only (non-deleted) administrator.
 *
 * These are the agendas that would be left without any administrator if the
 * account were deleted: account deletion anonymizes the user's memberships
 * (deletedUser: true) without going through the members.remove guard, so it can
 * still orphan an agenda. Surfaced to the user before they confirm deletion.
 */
export default (core, identifier) => async () => {
  const { users, members: membersSvc } = core.services;

  const user = await users.findOne({
    query: validateIdentifier(identifier, { pickOne: true }),
  });

  if (!user) {
    throw new NotFound({ info: { uid: identifier } }, 'user not found');
  }

  const { members } = await membersSvc.list(
    { userUid: user.uid, role: 'administrator' },
    { limit: 1000 },
    { detailed: true, total: true },
  );

  const soleAdminAgendas = [];

  for (const member of members) {
    const total = await countAdministrators(core.services, member.agendaUid);

    if (total <= 1 && member.agenda) {
      soleAdminAgendas.push({
        uid: member.agenda.uid,
        slug: member.agenda.slug,
        title: member.agenda.title,
      });
    }
  }

  return soleAdminAgendas;
};

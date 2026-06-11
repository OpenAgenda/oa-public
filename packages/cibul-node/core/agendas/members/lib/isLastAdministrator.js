import logs from '@openagenda/logs';

const log = logs('core/agendas/members/isLastAdministrator');

/**
 * Tells whether `member` is the only remaining (non-deleted) administrator of
 * the agenda. Used to prevent leaving an agenda without any administrator.
 *
 * Deleted users are excluded by the `members.list` filter (deletedUser defaults
 * to false), so an anonymized "ghost" admin never counts as a valid one.
 */
export default async ({ members }, { agendaUid, member }) => {
  const {
    utils: { getRoleSlug },
  } = members;

  if (getRoleSlug(member.role) !== 'administrator') {
    return false;
  }

  const { total } = await members.list(
    { agendaUid, role: 'administrator' },
    { limit: 1 },
    { total: true },
  );

  log('agenda %s has %d administrator(s)', agendaUid, total);

  return total <= 1;
};

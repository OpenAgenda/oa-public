import logs from '@openagenda/logs';
import countAdministrators from './countAdministrators.js';

const log = logs('core/agendas/members/isLastAdministrator');

/**
 * Tells whether removing or demoting `member` would leave the agenda without
 * any active administrator.
 *
 * `member` must itself be an active administrator (an account-bearing,
 * non-deleted administrator) for the guard to apply: removing a pending
 * invitation or a non-admin never orphans the agenda. Pending invitations are
 * excluded from the count too (see countAdministrators).
 */
export default async (services, { agendaUid, member }) => {
  const {
    members: {
      utils: { getRoleSlug },
    },
  } = services;

  // A pending invitation (null user_uid) is not a counted administrator, so
  // removing it can never orphan the agenda.
  if (!member.userUid) {
    return false;
  }

  if (getRoleSlug(member.role) !== 'administrator') {
    return false;
  }

  const total = await countAdministrators(services, agendaUid);

  log('agenda %s has %d active administrator(s)', agendaUid, total);

  return total <= 1;
};

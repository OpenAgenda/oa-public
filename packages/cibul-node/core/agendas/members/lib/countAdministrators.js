/**
 * Counts the *active* administrators of an agenda: administrators that hold a
 * real user account (withUser: true excludes pending email invitations, which
 * are stored as administrator rows with a null user_uid) and are not deleted
 * (deletedUser defaults to false). These are the only administrators that keep
 * an agenda manageable, so this is the count the last-administrator guard and
 * the sole-admin-agendas warning must use.
 */
export default async ({ members }, agendaUid) => {
  const { total } = await members.list(
    { agendaUid, role: 'administrator', withUser: true },
    { limit: 1 },
    { total: true },
  );

  return total ?? 0;
};

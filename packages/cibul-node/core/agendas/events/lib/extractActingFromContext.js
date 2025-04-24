export default async function extractActingFromContext(
  services,
  agendaUid,
  context = {},
) {
  const { users, members } = services;

  const {
    user: userFromContext,
    member: memberFromContext,
    userUid: userUidFromContext,
  } = context;

  const userUid = userFromContext?.uid ?? userUidFromContext ?? memberFromContext?.userUid;

  if (!userUid) {
    return { user: null, member: null };
  }

  return {
    user:
      userFromContext
      ?? await users.findOne({ query: { uid: userUid }, detailed: true }),
    member:
      memberFromContext
      ?? await members.get({ agendaUid, userUid }, { roleAsSlug: false }),
  };
}

export default function determineOwner(actingMember, agendaUid, userUid) {
  if (
    !actingMember
    || actingMember.role === undefined
    || actingMember.role === null
  ) {
    return { type: 'user', uid: userUid };
  }

  // Role values: 1 = contributor, 2 = moderator, 3 = administrator
  // If role is contributor (1), owner is user
  if (actingMember.role === 1 || actingMember.role === 'contributor') {
    return { type: 'user', uid: userUid };
  }

  // If role is moderator (2) or administrator (3), owner is agenda
  if (
    actingMember.role === 2
    || actingMember.role === 3
    || actingMember.role === 'moderator'
    || actingMember.role === 'administrator'
  ) {
    return { type: 'agenda', uid: agendaUid };
  }

  // Default fallback to user
  return { type: 'user', uid: userUid };
}

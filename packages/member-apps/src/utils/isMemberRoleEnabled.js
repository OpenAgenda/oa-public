export default function isMemberRoleEnabled(agenda) {
  return !!agenda.credentials.moderators;
}

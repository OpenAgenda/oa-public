export default function getMemberName(member, user) {
  return member.name ?? member.custom?.contactName ?? user.fullName;
}

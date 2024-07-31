export default function isAdminMod(member) {
  return ['administrator', 'moderator'].includes(member?.role);
}

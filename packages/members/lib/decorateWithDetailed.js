/**
 * Decorate a member with detailed user data
 * @param {Object} config - Configuration object with interfaces
 * @param {Object} member - Member object to decorate
 */
export default async function decorateWithDetailed({ interfaces }, member) {
  if (!member.userUid) {
    return;
  }

  if (interfaces.getUsersByUid) {
    [member.user] = await interfaces.getUsersByUid([member.userUid]);
  }
}

import logs from '@openagenda/logs';

const log = logs('decorateMembersWithUsers');

/**
 * Decorate members with user data
 * @param {Object} interfaces - Interface methods
 * @param {Array} members - Member array
 * @param {Object} userOptions - User options
 */
export default async function decorateMembersWithUsers(
  interfaces,
  members,
  userOptions,
) {
  const userUids = [
    ...new Set(members.map((member) => member.userUid).filter(Boolean)),
  ];
  if (!userUids.length) return;

  try {
    const users = await interfaces.getUsersByUid(userUids, userOptions);
    members.forEach((member) => {
      member.user = users.find((user) => user.uid === member.userUid);
    });
  } catch (error) {
    log('error', 'Failed to decorate members with user data', error);
  }
}

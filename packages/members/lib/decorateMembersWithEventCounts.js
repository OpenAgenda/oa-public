import logs from '@openagenda/logs';

const log = logs('decorateMembersWithEventCounts');

/**
 * Decorate members with event count data
 * @param {Object} interfaces - Interface methods
 * @param {Array} members - Member array
 * @param {string} agendaUid - Agenda UID
 */
export default async function decorateMembersWithEventCounts(
  interfaces,
  members,
  agendaUid,
) {
  if (!members.length) return;

  try {
    const stats = await interfaces.getEventCountByUserUid(
      agendaUid,
      members.map((member) => member.userUid),
    );
    stats.forEach((stat) => {
      const member = members.find((m) => m.userUid === stat.userUid);
      if (member) {
        member.eventCount = stat.count;
      }
    });
  } catch (error) {
    log('error', 'Failed to decorate members with event counts', error);
  }
}

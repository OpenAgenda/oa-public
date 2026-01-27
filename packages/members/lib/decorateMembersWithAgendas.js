import logs from '@openagenda/logs';

const log = logs('decorateMembersWithAgendas');

/**
 * Decorate members with agenda data
 * @param {Object} interfaces - Interface methods
 * @param {Array} members - Member array
 */
export default async function decorateMembersWithAgendas(interfaces, members) {
  const agendaUids = [
    ...new Set(members.map((member) => member.agendaUid).filter(Boolean)),
  ];
  if (!agendaUids.length) return;

  try {
    const agendas = await interfaces.getAgendasByUid(agendaUids);
    members.forEach((member) => {
      member.agenda = agendas.find((agenda) => agenda.uid === member.agendaUid);
    });
  } catch (error) {
    log('error', 'Failed to decorate members with agenda data', error);
  }
}

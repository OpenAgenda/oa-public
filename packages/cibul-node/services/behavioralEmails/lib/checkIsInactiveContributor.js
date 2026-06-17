import logs from '@openagenda/logs';

const log = logs('services/behavioralEmails/isInactiveContributor');

export default async function checkIsInactiveContributor(services, userUid) {
  try {
    const { items: agendas } = await services.core
      .users(userUid)
      .agendas.list({ size: 20 });

    const events = await services.events.list(
      { ownerUid: userUid },
      { limit: 1 },
      {
        draft: null,
        private: null,
      },
    );

    const isContributorOnly = agendas.every(
      (agenda) => agenda.member.role === 'contributor',
    );

    return {
      result: agendas.length > 0 && isContributorOnly && events.length === 0,
      lastAgenda: agendas[agendas.length - 1],
    };
  } catch (error) {
    log.error(error);
    return false;
  }
}

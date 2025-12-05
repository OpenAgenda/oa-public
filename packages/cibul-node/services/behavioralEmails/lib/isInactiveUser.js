import logs from '@openagenda/logs';

const log = logs('services/behavioralEmails/isInactiveUser');

export default async function isInactiveUser(services, userUid) {
  try {
    const { items: agendas } = await services.core
      .users({ uid: userUid })
      .agendas.list({ size: 1 });

    const events = await services.events.list(
      { ownerUid: userUid },
      { limit: 1 },
      {
        draft: null,
        private: null,
      },
    );

    return agendas.length === 0 && events.length === 0;
  } catch (error) {
    log.error(error);
    return false;
  }
}

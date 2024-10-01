import logs from '@openagenda/logs';

const log = logs('events/interfaces/beforeRemove');

export default async (services, event, context) => {
  const { agendaEvents: agendaEventsSvc } = services;

  log('will remove event %s', event.uid, { context });

  let hasMore;

  try {
    do {
      const { items: agendaEvents } = await agendaEventsSvc.list.byEventUid(
        event.uid,
        0,
        20,
      );

      for (const agendaEvent of agendaEvents) {
        await agendaEventsSvc(agendaEvent.agendaUid).remove(
          agendaEvent.eventUid,
          { context: { ...context, deletion: true } },
        );
      }

      hasMore = agendaEvents.length;
    } while (hasMore);
  } catch (e) {
    log(
      'error',
      'failed to remove all agenda event references for event uid %s, error: %s',
      event.uid,
      e,
    );
  }
};

import logs from '@openagenda/logs';

const log = logs('events/interfaces/beforeRemove');

export default async (services, event, context) => {
  const { agendaEvents: agendaEventsSvc, activities, agendas } = services;

  log('will remove event %s', event.uid, { context });

  let hasMore;

  try {
    do {
      const { items: agendaEvents } = await agendaEventsSvc.list.byEventUid(
        event.uid,
      );

      for (const { agendaUid, userUid } of agendaEvents) {
        await agendaEventsSvc(agendaUid).remove(event.uid, {
          context: { ...context, deletion: true },
        });

        const isOriginRef = event.agendaUid === agendaUid;

        if (activities && !isOriginRef) {
          try {
            await activities.addActivity(
              { entityType: 'event', entityUid: event.uid },
              {
                actor: `agenda:${agendaUid}`,
                verb: 'agenda.removeDeletedEvent',
                object: `event:${event.uid}`,
                target: `agenda:${agendaUid}`,
                store: {
                  contributorUid: userUid,
                  labels: {
                    object: event.title,
                    target: await agendas
                      .get(
                        { uid: agendaUid },
                        {
                          internal: true,
                          private: null,
                        },
                      )
                      .then((a) => a?.title),
                  },
                },
              },
            );
            log('added remove deleted event activity', {
              agendaUid,
              eventUid: event.uid,
            });
            await activities
              .feed({ entityType: 'agenda', entityUid: agendaUid })
              .unfollow({ entityType: 'event', entityUid: event.uid });
            log('removed link between agenda and event feeds', {
              agendaUid,
              eventUid: event.uid,
            });
          } catch (e) {
            log.error('failed to create remove deleted event activity', e);
          }
        }
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

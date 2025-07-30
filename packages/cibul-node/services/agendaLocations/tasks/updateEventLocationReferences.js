import logs from '@openagenda/logs';

const log = logs(
  'services/agendaLocations/tasks/updateEventLocationReferences',
);

export default async function updateEventLocationReferences(
  services,
  { locationsUids, mergedInLocationUid },
) {
  const { core, events: eventsSvc, tracker } = services;

  let events = [];
  tracker('agendaLocations.updateEventLocationReferences');

  for (const locationUid of locationsUids) {
    let hasMore = true;
    let offset = 0;

    do {
      const fetchedEvents = await eventsSvc
        .list(
          {
            locationUid,
          },
          {
            offset,
            limit: 100,
          },
          {
            includeFields: ['uid', 'agendaUid', 'locationUid'],
            private: null,
            draft: null,
          },
        )
        .then((e) => e);

      if (!fetchedEvents.length) {
        hasMore = false;
        continue;
      }
      events = events.concat(fetchedEvents);
      offset += 100;
    } while (hasMore);
  }

  for (const event of events) {
    try {
      log('setting location %s on event %s', mergedInLocationUid, event.uid);
      await core.agendas(event.agendaUid).events.patch(
        event.uid,
        {
          location: {
            uid: mergedInLocationUid,
          },
        },
        {
          access: 'internal',
        },
      );
    } catch (e) {
      log.error('failed to update event', {
        eventUid: event.uid,
        locationUid: event.locationUid,
        errors:
          e.shortMessage === 'data is invalid' ? e.info.errors : undefined,
        error: e?.shortMessage ? e.shortMessage : e,
      });
    }
  }
  tracker('agendaLocations.updateEventLocationReferences.done');
}

import logs from '@openagenda/logs';

const log = logs('services/agendaLocations/tasks/syncImpactedEventsAndAgendas');

const diffForPass = (before, after) =>
  before.address !== after.address
  || before.city !== after.city
  || before.postalCode !== after.postalCode;

export default async function syncImpactedEventsAndAgendas(
  services,
  { before, after: _after },
) {
  const {
    core,
    events: eventsSvc,
    agendaEvents,
    tracker,
    registrations,
  } = services;

  tracker('agendaLocations.syncImpactedEventsAndAgendas');

  const events = await eventsSvc.list(
    { locationUid: before.uid },
    { limit: 1000 },
    {
      includeFields: ['uid', 'registration', 'agenda'],
      access: 'internal',
      private: null,
      draft: null,
    },
  );

  log(
    '%s impacted events by location %s update',
    events.length,
    before.uid,
    events.length < 20 ? `(${events.map((e) => e.uid).join(', ')})` : null,
  );

  /* const impactedAgendaUids = []; */

  for (const event of events) {
    const relatedReferences = await agendaEvents.list
      .byEventUid(event.uid)
      .then(({ items }) => items);

    log(
      'found %s references for event %s',
      relatedReferences.length,
      event.uid,
    );

    for (const ae of relatedReferences) {
      const { agendaUid } = ae;
      const passCulturePayload = event.registration?.find(
        ({ service }) => service === 'passCulture',
      )?.data;

      if (diffForPass(before, _after) && passCulturePayload) {
        await registrations.utils.passCulture.loadAndProcess(
          agendaUid,
          event.uid,
        );
      }

      log('resyncing event %s in agenda %s', event.uid, agendaUid);
      try {
        await core.agendas(agendaUid).events.search.resyncEvent(event.uid);
      } catch (error) {
        if (error.name === 'NotFound') {
          log.warn(
            'failed to retrieve agenda matching evaluated agendaEvent ref',
            { error, agendaUid, eventUid: event.uid },
          );
        } else {
          log.error('failed to resync event', {
            eventUid: event.uid,
            agendaUid,
            error,
          });
        }
      }
    }
  }
  tracker('agendaLocations.syncImpactedEventsAndAgendas.done');
}

import logs from '@openagenda/logs';

const log = logs('services/agendaLocations/tasks/syncImpactedEventsAndAgendas');

export default (services) =>
  async function syncImpactedEventsAndAgendas(before, _after) {
    const { core, events: eventsSvc, agendaEvents, tracker } = services;

    tracker('agendaLocations.syncImpactedEventsAndAgendas');

    const uids = await eventsSvc
      .list(
        { locationUid: before.uid },
        { limit: 1000 },
        {
          includeFields: ['uid'],
          access: 'internal',
          private: null,
          draft: null,
        },
      )
      .then((events) => events.map((e) => e.uid));

    log(
      '%s impacted events by location %s update',
      uids.length,
      before.uid,
      uids.length < 20 ? `(${uids.join(', ')})` : null,
    );

    for (const eventUid of uids) {
      // update search indices
      const relatedReferences = await agendaEvents.list
        .byEventUid(eventUid)
        .then(({ items }) => items);

      log(
        'found %s references for event %s',
        relatedReferences.length,
        eventUid,
      );

      for (const ae of relatedReferences) {
        const { agendaUid } = ae;

        log('resyncing event %s in agenda %s', eventUid, agendaUid);
        try {
          await core.agendas(agendaUid).events.search.resyncEvent(eventUid);
        } catch (error) {
          if (error.name === 'NotFound') {
            log.warn(
              'failed to retrieve agenda matching evaluated agendaEvent ref',
              { error, agendaUid, eventUid },
            );
          } else {
            log.error('failed to resync event', { eventUid, agendaUid, error });
          }
        }
      }
    }

    tracker('agendaLocations.syncImpactedEventsAndAgendas.done');
  };

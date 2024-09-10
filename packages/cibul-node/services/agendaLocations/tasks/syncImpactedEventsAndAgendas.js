import logs from '@openagenda/logs';

const log = logs('services/agendaLocations/tasks/syncImpactedEventsAndAgendas');

export default (services) =>
  async function syncImpactedEventsAndAgendas(before, after) {
    const { core, legacy, events: eventsSvc, agendaEvents, tracker } = services;

    tracker('agendaLocations.syncImpactedEventsAndAgendas');

    const { controlData } = legacy;

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

    const impactedAgendaUids = [];

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

        if (!impactedAgendaUids.includes(agendaUid)) {
          impactedAgendaUids.push(agendaUid);
        }
      }
    }

    // update control data and search indices of impacted agendas
    for (const agendaUid of impactedAgendaUids) {
      await controlData.locationSet({
        agendaUid,
        location: after,
      });
    }

    tracker('agendaLocations.syncImpactedEventsAndAgendas.done');
  };

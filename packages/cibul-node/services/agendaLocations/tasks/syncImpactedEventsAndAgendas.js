'use strict';

const _ = require('lodash');
const log = require('@openagenda/logs')('services/agendaLocations/tasks/syncImpactedEventsAndAgendas');

module.exports = async function(services, before, after) {
  const {
    core,
    elasticsearch: legacyEventSearch,
    legacy,
    events: eventsSvc,
    agendaEvents,
    tracker
  } = services;

  tracker('agendaLocations.syncImpactedEventsAndAgendas');

  const controlData = legacy.controlData;

  const uids = await eventsSvc
    .list({ locationUid: before.uid }, { limit: 1000 }, {
      includeFields: ['uid'],
      access: 'internal',
      private: null,
      draft: null
    })
    .then(events => events.map(e => e.uid));

  const impactedAgendaUids = [];

  for (const eventUid of uids) {
    // reindex impacted events on legacy search
    try {
      legacyEventSearch && await legacyEventSearch.updateEvent({
        uid: eventUid
      });
    } catch (e) {
      log('error', 'could not update event %s index', eventUid, e);
    }

    // update search indices
    const relatedReferences = await agendaEvents.list
      .byEventUid(eventUid)
      .then(({ items }) => items);

    for (const ae of relatedReferences) {
      const { agendaUid } = ae;

      log('resyncing event %s in agenda %s', eventUid, agendaUid);
      await core.agendas(agendaUid).events.search.resyncEvent(eventUid, {
        throwOnError: false
      });

      if (!impactedAgendaUids.includes(agendaUid)) {
        impactedAgendaUids.push(agendaUid);
      }
    };
  }

  // update control data and search indices of impacted agendas
  for (const agendaUid of impactedAgendaUids) {
    await controlData.locationSet({
      agendaUid,
      location: after
    });
  }

  tracker('agendaLocations.syncImpactedEventsAndAgendas.done');
}

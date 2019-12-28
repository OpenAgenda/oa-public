'use strict';

const _ = require('lodash');
const log = require('@openagenda/logs')('core/agendas/events/list');
const getAgendaWithNetworkAndSchemas = require('../utils/getAgendaWithNetworkAndSchemas');
const merge = require('../utils/merge');

// this will be slower for bigger sets
// keep it fast with a last id nav on agendaEvents
module.exports = async (services, agendaUid, query = {}, nav = {}, options = {}) => {
  const {
    agendaEvents: agendaEventsSvc,
    events: eventsSvc,
    custom,
    agendas,
    agendaLocations
  } = services;

  const {
    lastId,
    limit
  } = {
    limit: 20,
    lastId: 0,
    ...nav
  };

  const {
    load,
    returnPayload,
    access,
    detailed
  } = {
    load: {
      event: true,
      agendaEvent: true,
      custom: true
    },
    returnPayload: false,
    access: 'public',
    detailed: false,
    ...options
  };

  const fetched = {};

  const agenda = await getAgendaWithNetworkAndSchemas(services, agendaUid);
  const formSchema = merge.schemasWithEvent(
    agenda.network ? agenda.network.formSchema : null,
    agenda.formSchema,
    access !== null ? { read: access } : null
  );

  const {
    lastId: newLastId,
    items: agendaEvents
  } = await agendaEventsSvc(agendaUid).listByLastId(query, lastId, limit);

  if (load.agendaEvent) {
    fetched.agendaEvents = agendaEvents
  }

  const eventUids = agendaEvents.map(ae => ae.eventUid);

  if (load.event) {
    fetched.events = (await eventsSvc.list({
      uid: eventUids
    }, {
      fetched: [
        'uid',
        'slug',
        'agendaUid',
        'title',
        'description',
        'keywords',
        'conditions',
        'timings',
        'image',
        'draft',
        'private',
        'locationUid'
      ].concat(
        detailed ? [
          'ownerUid',
          'creatorUid',
          'longDescription',
          'updatedAt',
          'createdAt',
          'deletedAt',
          'accessibility',
          'age',
          'registration',
          'references',
          'links',
          'fileKey'
        ] : []
      ).concat(
        access === 'internal' ? ['id',] : []
      )
    })).events;
  }

  if (load.custom && agenda.formSchemaId) {
    fetched.custom = (await custom(formSchemaId).list({
      identifier: eventUids
    })).items;
  }

  if (load.custom && agenda.network && agenda.network.formSchemaId) {
    fetched.networkCustom = (await custom(agenda.network.formSchemaId).list({
      identifier: eventUids
    })).items;
  }

  if (detailed && load.event) {
    fetched.originAgendas = (await agendas.list({
      uid: fetched.events.map(e => e.agendaUid)
    })).agendas.map(a => _.omit(a, ['id', 'indexed']));
  }

  if (detailed && load.event) {
    fetched.locations = await listLocations(
      agendaLocations,
      fetched.events.map(e => e.locationUid)
    );
  }

  const compiledEvents = eventUids.map((uid, index) => {
    const event = _.find(fetched.events, { uid });
    return { uid, ...merge.eventFromObject({
      agendaEvent: fetched.agendaEvents[index],
      event: load.event ? Object.assign(event, detailed ? {
        location: _.find(fetched.locations, { uid: event.locationUid }, null),
        agenda: _.find(fetched.originAgendas, { uid: event.agendaUid }, null)
      } : {}) : null,
      custom: load.custom ? {
        agenda: (_.find(fetched.custom, { identifier: uid }) || {}).custom,
        network: (_.find(fetched.networkCustom, { identifier: uid }) || {}).custom
      } : null
    }, {
      includeFields: formSchema.fields.map(f => f.field),
      originAgenda: load.event ? _.find(fetched.originAgendas, { uid: event.agendaUid }) : null,
      load
    }) }
  });

  return returnPayload ? {
    lastId: newLastId,
    events: compiledEvents,
    success: true,
    agenda,
    formSchema
  } : compiledEvents

}


function listLocations(agendaLocations, uids) {
  return new Promise((rs, rj) => {
    agendaLocations.list({
      uid: uids
    }, 0, uids.length, { fromDb: true }, (err, locations) => {
      if (err) {
        return rj(err);
      }
      rs(locations.map(l => _.omit(l, ['store', 'agendaId', 'eveId'])));
    });
  });
}

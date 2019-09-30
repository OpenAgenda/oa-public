'use strict';

const _ = require('lodash');
const agendaEventSvc = require('@openagenda/agenda-events');
const eventsSvc = require('@openagenda/events');
const custom = require('@openagenda/custom');

const log = require('@openagenda/logs')('core/agendas/events/get');

const getAgenda = require('../utils/getAgenda');
const getNetwork = require('../utils/getNetwork');

// this will be slower for bigger sets
// keep it fast with a last id nav on agendaEvents
module.exports = async (agendaUid, query = {}, nav = {}, options = {}) => {
  const {
    lastId,
    limit
  } = Object.assign({
    limit: 20,
    lastId: 0
  }, nav);

  const {
    load
  } = Object.assign({
    load: { events: true, custom: true }
  }, options);

  const agenda = await getAgenda(agendaUid);

  const {
    formSchemaId,
    networkUid,
    id: agendaId
  } = agenda;

  let network;

  const {
    lastId: newLastId,
    items: agendaEvents
  } = await agendaEventSvc(agendaUid).listByLastId(query, lastId, limit);

  const events = agendaEvents.map(ae => ({
    uid: ae.eventUid,
    state: ae.state,
    featured: ae.featured
  }));

  const eventUids = agendaEvents.map(ae => ae.eventUid);

  if (load.events) {
    await eventsSvc.list({ uid: eventUids }).then(result => {
      events.forEach(e => {
        Object.assign(e, _.find(result.events, { uid: e.uid }) || {});
      });
    });
  }

  if (load.custom && agenda.formSchemaId) {
    const customData = await custom(formSchemaId).list({
      identifier: eventUids
    }).items;

    events.forEach(e => {
      Object.assign(e, _.get(_.find(customData, { identifier: e.uid }), 'custom', {}));
    });
  }

  if (load.custom && agenda.networkUid) {
    const networkSchemaId = _.get(await getNetwork(networkUid), 'formSchemaId');

    if (networkSchemaId) {
      const customData = await custom(formSchemaId).list({
        identifier: eventUids
      }).items;

      events.forEach(e => {
        Object.assign(e, _.get(_.find(customData, { identifier: e.uid }), 'custom', {}));
      });
    }
  }

  return {
    events,
    lastId: newLastId
  }
}

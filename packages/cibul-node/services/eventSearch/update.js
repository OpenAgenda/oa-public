'use strict';

const log = require('@openagenda/logs')('services/eventSearch/update');

const getAgendaSearchIndex = require('./lib/getAgendaSearchIndex');
const hasOtherPublishedReferences = require('./lib/hasOtherPublishedReferences');

module.exports = (services, queue, eventSearch) => {
  const {
    agendaEvents
  } = services;

  queue.register({
    loadOtherUpdates: loadOtherUpdates.bind(null, services, queue),
    otherUpdate: otherUpdate.bind(null, services, eventSearch)
  });

  return async ({ agenda, member, formSchema, event }) => {
    log('update');

    await updateAgendaIndex(eventSearch, {
      agenda,
      formSchema,
      member,
      event
    });

    log('update transverse index');
    if (event.state !== 2 && !await hasOtherPublishedReferences(agendaEvents, agenda.uid, event.uid) ) {
      await queue('transverseIndexRemove', event);
    } else {
      await queue('transverseIndexUpdate', event);
    }

    log('update other indices');
    await queue('loadOtherUpdates', agenda.uid, event.uid);

    log('done');
  };
}

async function loadOtherUpdates(services, queue, agendaUid, eventUid) {
  const {
    agendaEvents
  } = services;

  log('loadOtherUpdates');
  const remainingAgendaUids = await agendaEvents.list.byEventUid(eventUid, {
    excludeAgendaUid: agendaUid
  }, 0, 1000).then(r => r.items.map(ae => ae.agendaUid));

  log('loadOtherUpdates: remainingAgendaUids: %j', remainingAgendaUids);

  // here you know if it is published somewhere or not
  for (const remainingAgendaUid of remainingAgendaUids) {
    await queue('otherUpdate', remainingAgendaUid, eventUid);
  }
}

async function otherUpdate(services, eventSearch, agendaUid, eventUid) {
  const { core } = services;

  log('otherUpdate', agendaUid, eventUid);

  const {
    event,
    member,
    formSchema,
    agenda
  } = await core.agendas(agendaUid).events.get(eventUid, {
    returnPayload: true,
    access: 'internal'
  });

  return updateAgendaIndex(eventSearch, {
    agenda,
    formSchema,
    member,
    event
  });
}

async function updateAgendaIndex(eventSearch, { agenda, formSchema, member, event }) {
  log('updateAgendaIndex');

  const data = {
    ...event,
    member
  };

  const searchIndex = getAgendaSearchIndex(eventSearch, agenda.uid);

  log('update current agenda index');
  await searchIndex.update({
    uid: event.uid
  }, data, { refresh: true, formSchema });

  log('updated');
}

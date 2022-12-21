'use strict';

const log = require('@openagenda/logs')('services/eventSearch/update');

const getAgendaSearchIndex = require('./lib/getAgendaSearchIndex');
const hasOtherPublishedReferences = require('./lib/hasOtherPublishedReferences');

async function loadOtherUpdates(services, queue, agendaUid, eventUid) {
  const {
    agendaEvents,
  } = services;

  log('loadOtherUpdates');
  const remainingAgendaUids = await agendaEvents.list.byEventUid(eventUid, {
    excludeAgendaUid: agendaUid,
  }, 0, 1000).then(r => r.items.map(ae => ae.agendaUid));

  log('loadOtherUpdates: remainingAgendaUids: %j', remainingAgendaUids);

  // here you know if it is published somewhere or not
  for (const remainingAgendaUid of remainingAgendaUids) {
    await queue('otherUpdate', remainingAgendaUid, eventUid);
  }
}

async function updateAgendaIndex(eventSearch, {
  agenda,
  formSchema,
  member,
  event,
}) {
  log('  updateAgendaIndex');

  const data = {
    ...event,
    member,
  };

  const searchIndex = getAgendaSearchIndex(eventSearch, agenda.uid);

  log('  update agenda index', agenda.uid);

  await searchIndex.update({
    uid: event.uid,
  }, data, {
    refresh: true,
    operation: 'index',
    formSchema,
    agenda,
  });

  log('  updated');
}

async function otherUpdate(services, eventSearch, agendaUid, eventUid) {
  const {
    core,
    tracker,
  } = services;

  log('  otherUpdate', agendaUid, eventUid);

  const {
    event,
    member,
    formSchema,
    agenda,
  } = await core.agendas(agendaUid).events.get(eventUid, {
    returnPayload: true,
    detailed: true,
    access: 'internal',
  });

  if (tracker) {
    tracker(`eventSearch.otherUpdate:${agendaUid}.${eventUid}`);
  }

  const result = await updateAgendaIndex(eventSearch, {
    agenda,
    formSchema,
    member,
    event,
  });

  if (tracker) {
    tracker(`eventSearch.otherUpdate.done:${agendaUid}.${eventUid}`);
  }

  return result;
}

module.exports = (services, queue, eventSearch) => {
  const {
    agendaEvents,
    tracker,
  } = services;

  queue.register({
    loadOtherUpdates: loadOtherUpdates.bind(null, services, queue),
    otherUpdate: otherUpdate.bind(null, services, eventSearch),
  });

  return async ({
    agenda,
    member,
    formSchema,
    event,
  }, options = {}) => {
    log('update', { agendaUid: agenda.uid, eventUid: event.uid, member: member?.userUid });

    if (tracker) {
      tracker(`eventSearch.update:${agenda.uid}.${event.uid}`);
    }

    const {
      updateOtherIndices = true,
    } = options;

    await updateAgendaIndex(eventSearch, {
      agenda,
      formSchema,
      member,
      event,
    });

    if (event.state !== 2 && !await hasOtherPublishedReferences(agendaEvents, agenda.uid, event.uid)) {
      await queue('transverseIndexRemove', event.uid);
    } else {
      await queue('transverseIndexUpdate', event);
    }

    if (updateOtherIndices) {
      log('update other indices');
      await queue('loadOtherUpdates', agenda.uid, event.uid);
    }

    log('done');
  };
};

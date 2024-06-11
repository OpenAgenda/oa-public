import logs from '@openagenda/logs';
import updateAgendaIndex from './updateAgendaIndex.mjs';

const log = logs('services/eventSearch/otherUpdates');

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

export default {
  otherUpdate,
  loadOtherUpdates,
};

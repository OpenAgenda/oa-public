'use strict';

const log = require('@openagenda/logs')('services/eventSearch/update');

module.exports = ({ core, agendaEvents, eventSearch, queue }) => {
  queue.register({
    eventIndexUpdate: eventIndexUpdate.bind(null, eventSearch),
    loadOtherUpdates: loadOtherUpdates.bind(null, { agendaEvents, eventSearch, queue }),
    otherUpdate: otherUpdate.bind(null, { eventSearch, core })
  });

  return async data => {
    await update({ eventSearch }, data);
    await queue('eventIndexUpdate', data.event);
    await queue('loadOtherUpdates', data.agendaEvent.agendaUid, data.event.uid);
  };
}

async function update({ eventSearch }, data) {
  log('update', data.agendaEvent.agendaUid, data.event.uid);
}

async function loadOtherUpdates({ agendaEvents, eventSearch, queue }, agendaUid, eventUid) {
  const remainingAgendaUids = await agendaEvents.list.byEventUid(eventUid, 0, 1000)
    .then(result => result
      .items.filter(ae => ae.agendaUid !== agendaUid)
      .map(ae => ae.agendaUid)
    );

  for (const remainingAgendaUid of remainingAgendaUids) {
    await queue('otherUpdate', remainingAgendaUid, eventUid);
  }
}

function eventIndexUpdate(eventSearch, event) {
  log('eventIndexUpdate', event.uid);
}

function otherUpdate({ eventSearch, core }, agendaUid, eventUid) {
  log('otherUpdate', agendaUid, eventUid);
}

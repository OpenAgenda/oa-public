'use strict';

const log = require('@openagenda/logs')('services/eventSearch/remove');

const getAgendaSearchIndex = require('./lib/getAgendaSearchIndex');

module.exports = (services, queue, eventSearch) => {
  queue.register({
    removeFromAgendaIndex: removeFromAgendaIndex.bind(null, eventSearch)
  });

  return async ({ event, agenda, deletion, otherAgendaReferences }) => {
    log('remove');

    try {
      await removeFromAgendaIndex(eventSearch, agenda.uid, event.uid, true);
    } catch (e) {
      log('error', 'failed to remove event from agenda %s index: %s', agenda.uid, e.message);
    }


    log('update transverse index');
    if (!otherAgendaReferences.filter(ae => ae.state === 2).length) {
      await queue('transverseIndexRemove', event.uid);
    }

    if (!deletion) {
      return log('done');
    }

    for (const { agendaUid } of otherAgendaReferences) {
      await queue('removeFromAgendaIndex', agendaUid, event.uid);
    }

    log('done');
  }
}

async function removeFromAgendaIndex(eventSearch, agendaUid, eventUid, refresh = false) {
  log('removeFromAgendaIndex');

  const searchIndex = getAgendaSearchIndex(eventSearch, agendaUid);

  return searchIndex.remove({ uid: eventUid }, { refresh });
}

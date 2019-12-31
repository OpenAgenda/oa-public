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

    if (!deletion) {
      return log('done');
    }

    log('update transverse index');
    if (!otherAgendaReferences.map(ae => ae.state).filter(state === 2).length) {
      await queue('transverseIndexRemove', event.uid);
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

  if (!await searchIndex.exists()) {
    log('warn', 'not removing: index for agenda %s does not exist', agendaUid);
    return;
  }

  return searchIndex.remove({ uid: eventUid }, { refresh });
}

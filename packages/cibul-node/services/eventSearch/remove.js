import logs from '@openagenda/logs';
import getAgendaSearchIndex from './lib/getAgendaSearchIndex.js';

const log = logs('services/eventSearch/remove');

export async function removeFromAgendaIndex(
  eventSearch,
  { agendaUid, eventUid, refresh = false },
) {
  log('removeFromAgendaIndex');

  const searchIndex = getAgendaSearchIndex(eventSearch, agendaUid);

  return searchIndex.remove({ uid: eventUid }, { refresh });
}

export default (queue, eventSearch) =>
  async ({ event, agenda, deletion, otherAgendaReferences = [] }) => {
    log('remove');

    try {
      await removeFromAgendaIndex(eventSearch, {
        agendaUid: agenda.uid,
        eventUid: event.uid,
        refresh: true,
      });
    } catch (e) {
      log(
        'error',
        'failed to remove event from agenda %s index: %s',
        agenda.uid,
        e.message,
      );
    }

    log('update transverse index');
    if (!otherAgendaReferences.filter((ae) => ae.state === 2).length) {
      await queue.add('transverseIndexRemove', event.uid);
    }

    if (!deletion) {
      return log('done');
    }

    for (const { agendaUid } of otherAgendaReferences) {
      await queue.add('removeFromAgendaIndex', {
        agendaUid,
        eventUid: event.uid,
      });
    }

    log('done');
  };

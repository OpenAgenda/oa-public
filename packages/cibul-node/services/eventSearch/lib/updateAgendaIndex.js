import logs from '@openagenda/logs';
import getAgendaSearchIndex from './getAgendaSearchIndex.js';

const log = logs('services/eventSearch/updateAgendaIndex');

export default async function updateAgendaIndex(
  eventSearch,
  { agenda, formSchema, member, event, batch = false },
) {
  log('  updateAgendaIndex');

  const data = {
    ...event,
    member,
  };

  const searchIndex = getAgendaSearchIndex(eventSearch, agenda.uid);

  log('  update agenda index', agenda.uid);

  await searchIndex.update(
    {
      uid: event.uid,
    },
    data,
    {
      refresh: !batch,
      operation: 'index',
      formSchema,
      agenda,
    },
  );

  log('  updated');
}

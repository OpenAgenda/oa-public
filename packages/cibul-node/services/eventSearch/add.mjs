import logs from '@openagenda/logs';
import getAgendaSearchIndex from './lib/getAgendaSearchIndex.mjs';
import hasOtherPublishedReferences from './lib/hasOtherPublishedReferences.mjs';

const log = logs('services/eventSearch/add');

export default (services, queue, eventSearch) => {
  const {
    agendaEvents,
  } = services;

  return async ({ agenda, member, formSchema, event }) => {
    log('add');

    const searchIndex = getAgendaSearchIndex(eventSearch, agenda.uid);

    const data = {
      ...event,
      member,
    };

    const result = await searchIndex.add(data, { refresh: true, formSchema, agenda });

    log('added', result);

    if (event.state !== 2) {
      log('done');
      return;
    }

    if (!(await hasOtherPublishedReferences(agendaEvents, agenda.uid, event.uid))) {
      await queue('transverseIndexUpdate', event);
    }

    log('done');
  };
};

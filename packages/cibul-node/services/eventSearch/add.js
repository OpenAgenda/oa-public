import logs from '@openagenda/logs';
import getAgendaSearchIndex from './lib/getAgendaSearchIndex.js';
import hasOtherPublishedReferences from './lib/hasOtherPublishedReferences.js';

const log = logs('services/eventSearch/add');

export default (services, queue, eventSearch) => {
  const { agendaEvents } = services;

  return async ({ agenda, member, formSchema, event }, options = {}) => {
    log('add');

    const { updateOtherIndices = true } = options;

    const searchIndex = getAgendaSearchIndex(eventSearch, agenda.uid);

    const data = {
      ...event,
      member,
    };

    const result = await searchIndex.add(data, {
      refresh: true,
      formSchema,
      agenda,
    });

    log('added', result);

    if (
      event.state === 2
      || await hasOtherPublishedReferences(agendaEvents, agenda.uid, event.uid)
    ) {
      await queue('transverseIndexUpdate', event);
    }

    if (updateOtherIndices) {
      log('update other indices');
      await queue('loadOtherUpdates', agenda.uid, event.uid);
    }

    log('done');
  };
};

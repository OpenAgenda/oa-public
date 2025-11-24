import logs from '@openagenda/logs';
import hasOtherPublishedReferences from './lib/hasOtherPublishedReferences.js';
import updateAgendaIndex from './lib/updateAgendaIndex.js';

const log = logs('services/eventSearch/update');

export default (services, queue, eventSearch) => {
  const { agendaEvents, tracker } = services;

  return async ({ agenda, member, formSchema, event }, options = {}) => {
    log('update', {
      agendaUid: agenda.uid,
      eventUid: event.uid,
      member: member?.userUid,
    });

    if (tracker) {
      tracker(`eventSearch.update:${agenda.uid}.${event.uid}`);
    }

    const { updateOtherIndices = true } = options;

    await updateAgendaIndex(eventSearch, {
      agenda,
      formSchema,
      member,
      event,
    });

    if (
      !event.private
      && event.state !== 2
      && !await hasOtherPublishedReferences(agendaEvents, agenda.uid, event.uid)
    ) {
      await queue.add('transverseIndexRemove', event.uid);
    } else if (!event.private) {
      await queue.add('transverseIndexUpdate', event);
    } else {
      tracker(`eventSearch.update:${agenda.uid}.${event.uid}:noTransverse`);
    }

    if (updateOtherIndices) {
      log('update other indices');
      await queue.add('loadOtherUpdates', {
        agendaUid: agenda.uid,
        eventUid: event.uid,
      });
    }

    log('done');
  };
};

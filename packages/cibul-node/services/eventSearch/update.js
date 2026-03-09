import logs from '@openagenda/logs';
import updateAgendaIndex from './lib/updateAgendaIndex.js';
import { transverseUpdateEvaluateUpdateEnqueue } from './transverseIndex.js';

const log = logs('services/eventSearch/update');

export default (services, queue, eventSearch) => {
  const { tracker } = services;

  return async ({ agenda, member, formSchema, event }, options = {}) => {
    log('update', {
      agendaUid: agenda.uid,
      eventUid: event.uid,
      member: member?.userUid,
    });

    if (tracker) {
      tracker(`eventSearch.update:${agenda.uid}.${event.uid}`);
    }

    const { updateOtherIndices = true, batch = false } = options;

    await updateAgendaIndex(eventSearch, {
      agenda,
      formSchema,
      member,
      event,
      batch,
    });

    await transverseUpdateEvaluateUpdateEnqueue(services, queue, agenda, event);

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

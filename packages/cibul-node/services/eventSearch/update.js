import logs from '@openagenda/logs';
import Stopwatch from '../../lib/Stopwatch.js';
import updateAgendaIndex from './lib/updateAgendaIndex.js';
import { transverseUpdateEvaluateUpdateEnqueue } from './transverseIndex.js';

const log = logs('services/eventSearch/update');

export default (services, queue, eventSearch) => {
  const { tracker } = services;

  return async ({ agenda, member, formSchema, event }, options = {}) => {
    const stopwatch = Stopwatch();

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

    stopwatch('updateAgendaIndex');

    await transverseUpdateEvaluateUpdateEnqueue(services, queue, agenda, event);

    stopwatch('transverseUpdate');

    if (updateOtherIndices) {
      log('update other indices');
      await queue.add('loadOtherUpdates', {
        agendaUid: agenda.uid,
        eventUid: event.uid,
      });
      stopwatch('loadOtherUpdates');
    }

    log('done');

    return { times: stopwatch.getTimes() };
  };
};

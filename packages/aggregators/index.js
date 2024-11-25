import logs from '@openagenda/logs';
import getAgendaSourceId from './utils/getAgendaSourceId.js';
import addSourceEntry from './utils/sources/add.js';
import removeSourceEntry from './utils/sources/remove.js';
import listSources from './utils/sources/list.js';
import updateSourceEntry from './utils/sources/update.js';
import getSourceEntry from './utils/sources/get.js';
import dispatch from './lib/dispatch.js';
import addSource from './lib/addSource.js';
import updateSource from './lib/updateSource.js';
import removeSource from './lib/removeSource.js';
import notify from './lib/notify.js';
import { removeEvent } from './lib/removeEvent.js';
import loadSourceEvaluates from './lib/loadSourceEvaluates.js';
import loadSourceRemoves from './lib/loadSourceRemoves.js';
import { evaluateEvent } from './lib/evaluateEvent.js';
import remove from './lib/remove.js';
import set from './lib/set.js';
import get from './lib/get.js';

const log = logs('aggregators');

function task({ queue }) {
  queue.run();

  return {
    stopAndClear: async () => {
      await queue.clear();
      await queue.stop();
    },
  };
}

export default ({ knex, queues, interfaces, logger }) => {
  const queue = queues('aggregator');

  if (logger) {
    logs.setModuleConfig(logger);
  }

  queue.register({
    dispatch: dispatch.bind(null, { knex, queue }),
    evaluateEvent: evaluateEvent.bind(null, {
      getAggregatedCount: interfaces.getAggregatedCount,
      referenceEvent: interfaces.referenceEvent,
      getMergedSchema: interfaces.getMergedSchema,
      getEventReference: interfaces.getEventReference,
      updateSourcePaths: interfaces.updateSourcePaths,
      updateEventReference: interfaces.updateEventReference,
      enqueueRemove: queue.bind(null, 'removeEvent'),
      enqueueEvaluate: queue.bind(null, 'evaluateEvent'),
    }),
    removeEvent: removeEvent.bind(null, {
      getEventReference: interfaces.getEventReference,
      unreferenceEvent: interfaces.unreferenceEvent,
      updateSourcePaths: interfaces.updateSourcePaths,
      enqueueRemove: queue.bind(null, 'removeEvent'),
    }),
    loadSourceEvaluates: loadSourceEvaluates.bind(null, {
      listEventReferences: interfaces.listEventReferences,
      enqueueEvaluate: queue.bind(null, 'evaluateEvent'),
    }),
    loadSourceRemoves: loadSourceRemoves.bind(null, {
      listEventReferences: interfaces.listEventReferences,
      enqueueRemove: queue.bind(null, 'removeEvent'),
    }),
  });

  queue.on('error', (fn, args, error) => log('error', fn, args, error));
  queue.on('execute', (fn) => log('processing "%s" from queue', fn));
  queue.on('success', (fn, args, result) =>
    log('done processing "%s" from queue', fn, result));

  return {
    get: get.bind(null, {
      knex,
      getAggregatedCount: interfaces.getAggregatedCount,
    }),
    set: set.bind(null, knex),
    remove: remove.bind(null, knex),
    sources: {
      getId: getAgendaSourceId.bind(null, knex),
      list: listSources.bind(null, {
        knex,
        getAgendasByUids: interfaces.getAgendasByUids,
      }),
      add: addSource.bind(null, {
        knex,
        interfaces,
        enqueueLoadSourceEvaluates: queue.bind(null, 'loadSourceEvaluates'),
        addSourceEntry: addSourceEntry.bind(null, knex),
        getAgendaSourceId: getAgendaSourceId.bind(null, knex),
        getMergedSchema: interfaces.getMergedSchema,
        onAddSource: interfaces.onAddSource,
      }),
      update: updateSource.bind(null, {
        interfaces,
        enqueueLoadSourceEvaluates: queue.bind(null, 'loadSourceEvaluates'),
        updateSourceEntry: updateSourceEntry.bind(null, knex),
        getAgendaSourceId: getAgendaSourceId.bind(null, knex),
        getMergedSchema: interfaces.getMergedSchema,
        getSourceEntry: getSourceEntry.bind(null, {
          knex,
          getAgendasByUids: interfaces.getAgendasByUids,
        }),
      }),
      remove: removeSource.bind(null, {
        interfaces,
        enqueueLoadSourceRemoves: queue.bind(null, 'loadSourceRemoves'),
        getSourceEntry: getSourceEntry.bind(null, {
          knex,
          getAgendasByUids: interfaces.getAgendasByUids,
        }),
        removeSourceEntry: removeSourceEntry.bind(null, knex),
        getAgendaSourceId: getAgendaSourceId.bind(null, knex),
        onRemoveSource: interfaces.onRemoveSource,
      }),
    },
    notify: notify.bind(null, {
      getAgendaSourceId: getAgendaSourceId.bind(null, knex),
      queue,
    }),
    task: task.bind(null, { queue }),
  };
};

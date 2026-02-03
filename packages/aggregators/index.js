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

export default ({ knex, queue, createWorker, interfaces, logger }) => {
  if (logger) {
    logs.setModuleConfig(logger);
  }

  const worker = createWorker(async (job) => {
    switch (job.name) {
      case 'dispatch': {
        await dispatch({ knex, queue }, job.data.action, job.data.data);
        break;
      }
      case 'evaluateEvent': {
        await evaluateEvent(
          {
            getAggregatedCount: interfaces.getAggregatedCount,
            referenceEvent: interfaces.referenceEvent,
            getMergedSchema: interfaces.getMergedSchema,
            getEventReference: interfaces.getEventReference,
            updateSourcePaths: interfaces.updateSourcePaths,
            updateEventReference: interfaces.updateEventReference,
            enqueueRemove: queue.add.bind(queue, 'removeEvent'),
            enqueueEvaluate: queue.add.bind(queue, 'evaluateEvent'),
          },
          job.data,
        );
        break;
      }
      case 'removeEvent': {
        await removeEvent(
          {
            getEventReference: interfaces.getEventReference,
            unreferenceEvent: interfaces.unreferenceEvent,
            updateSourcePaths: interfaces.updateSourcePaths,
            enqueueRemove: queue.add.bind(queue, 'removeEvent'),
          },
          job.data,
        );
        break;
      }
      case 'loadSourceEvaluates': {
        await loadSourceEvaluates(
          {
            listEventReferences: interfaces.listEventReferences,
            enqueueEvaluate: queue.add.bind(queue, 'evaluateEvent'),
          },
          job.data,
        );
        break;
      }
      case 'loadSourceRemoves': {
        await loadSourceRemoves(
          {
            listEventReferences: interfaces.listEventReferences,
            enqueueRemove: queue.add.bind(queue, 'removeEvent'),
          },
          job.data,
        );
        break;
      }
      default:
        log.warn(`Unknown job ${job.name}`);
    }
  });

  worker.on('error', (failedReason) => log.error('error', failedReason));
  worker.on('failed', (job, error) => log.error(job.name, job.data, error));
  worker.on('active', (job) =>
    log.info('processing "%s" from queue', job.name));
  worker.on('completed', (job, result, _prev) =>
    log.info('done processing "%s" from queue', job.name, result));

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
        getAgendasByUids: interfaces.getAgendasByUids,
        enqueueLoadSourceEvaluates: queue.add.bind(
          queue,
          'loadSourceEvaluates',
        ),
        addSourceEntry: addSourceEntry.bind(null, knex),
        getAgendaSourceId: getAgendaSourceId.bind(null, knex),
        getMergedSchema: interfaces.getMergedSchema,
        onAddSource: interfaces.onAddSource,
      }),
      update: updateSource.bind(null, {
        enqueueLoadSourceEvaluates: queue.add.bind(
          queue,
          'loadSourceEvaluates',
        ),
        updateSourceEntry: updateSourceEntry.bind(null, knex),
        getAgendaSourceId: getAgendaSourceId.bind(null, knex),
        getMergedSchema: interfaces.getMergedSchema,
        getSourceEntry: getSourceEntry.bind(null, {
          knex,
          getAgendasByUids: interfaces.getAgendasByUids,
        }),
      }),
      remove: removeSource.bind(null, {
        enqueueLoadSourceRemoves: queue.add.bind(queue, 'loadSourceRemoves'),
        getSourceEntry: getSourceEntry.bind(null, {
          knex,
          getAgendasByUids: interfaces.getAgendasByUids,
        }),
        removeSourceEntry: removeSourceEntry.bind(null, knex),
        getAgendaSourceId: getAgendaSourceId.bind(null, knex),
        onRemoveSource: interfaces.onRemoveSource,
        getAgendasByUids: interfaces.getAgendasByUids,
      }),
    },
    notify: notify.bind(null, {
      getAgendaSourceId: getAgendaSourceId.bind(null, knex),
      queue,
    }),
    worker,
  };
};

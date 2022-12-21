'use strict';

const _ = require('lodash');
const logs = require('@openagenda/logs');

const log = logs('aggregators');

const getAgendaSourceId = require('./utils/getAgendaSourceId');

const addSourceEntry = require('./utils/sources/add');
const removeSourceEntry = require('./utils/sources/remove');
const listSources = require('./utils/sources/list');
const updateSourceEntry = require('./utils/sources/update');
const getSourceEntry = require('./utils/sources/get');

const dispatch = require('./lib/dispatch');
const addSource = require('./lib/addSource');
const updateSource = require('./lib/updateSource');
const removeSource = require('./lib/removeSource');
const notify = require('./lib/notify');
const removeEvent = require('./lib/removeEvent');
const loadSourceEvaluates = require('./lib/loadSourceEvaluates');
const loadSourceRemoves = require('./lib/loadSourceRemoves');
const evaluateEvent = require('./lib/evaluateEvent');
const remove = require('./lib/remove');
const set = require('./lib/set');
const get = require('./lib/get');

function task({ queue }) {
  queue.run();

  return {
    stopAndClear: async () => {
      await queue.clear();
      await queue.stop();
    },
  };
}

module.exports = ({ knex, queues, interfaces, logger }) => {
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
    }),
    removeEvent: removeEvent.bind(
      null,
      _.pick(interfaces, [
        'getEventReference',
        'updateSourcePaths',
        'unreferenceEvent',
      ]),
    ),
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
  queue.on('execute', fn => log('processing "%s" from queue', fn));
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

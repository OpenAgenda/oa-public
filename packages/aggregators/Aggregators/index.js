'use strict';

const _ = require('lodash');
const log = require('@openagenda/logs')('Aggregators');

const isAgendaSource = require('./utils/isAgendaSource');
const addSourceEntry = require('./utils/sourceEntry').add;
const removeSourceEntry = require('./utils/sourceEntry').remove;

const dispatch = require('./lib/dispatch');
const addSource = require('./lib/addSource');
const removeSource = require('./lib/removeSource');
const notify = require('./lib/notify');
const remove = require('./lib/remove');
const loadSourceEvaluates = require('./lib/loadSourceEvaluates');
const loadSourceRemoves = require('./lib/loadSourceRemoves');
const evaluate = require('./lib/evaluate');

module.exports = ({ knex, queues, interfaces }) => {
  const queue = queues('aggregator');

  queue.register({
    dispatch: dispatch.bind(null, { knex, queue }),
    evaluate: evaluate.bind(null, {
      referenceEvent: interfaces.referenceEvent,
      getMergedSchema: interfaces.getMergedSchema,
      getEventReference: interfaces.getEventReference,
      setSourceUidOnExistingReference: interfaces.setSourceUidOnExistingReference,
      enqueueRemove: queue.bind(null, 'remove')
    }),
    remove: remove.bind(null, _.pick(interfaces, [
      'getEventReference',
      'unsetSourceUidOnExistingReference',
      'unreferenceEvent'
    ])),
    loadSourceEvaluates: loadSourceEvaluates.bind(null, {
      listEventReferences: interfaces.listEventReferences,
      loadEvent: interfaces.loadEvent,
      enqueueEvaluate: queue.bind(null, 'evaluate')
    }),
    loadSourceRemoves: loadSourceRemoves.bind(null, {
      listEventReferences: interfaces.listEventReferences,
      enqueueRemove: queue.bind(null, 'remove')
    })
  });

  queue.on('error', (fn, args, error) => log('error', fn, args, error));
  queue.on('execute', (fn, args) => log(fn, 'execute'));
  queue.on('success', (fn, args, result) => log(fn, 'success', result));

  return {
    notify: notify.bind(null, {
      isAgendaSource: isAgendaSource.bind(null, knex),
      queue
    }),
    addSource: addSource.bind(null, {
      knex,
      interfaces,
      enqueueLoadSourceEvaluates: queue.bind(null, 'loadSourceEvaluates'),
      addSourceEntry: addSourceEntry.bind(null, knex),
      isAgendaSource: isAgendaSource.bind(null, knex),
      getMergedSchema: interfaces.getMergedSchema
    }),
    removeSource: removeSource.bind(null, {
      knex,
      interfaces,
      enqueueLoadSourceRemoves: queue.bind(null, 'loadSourceRemoves'),
      removeSourceEntry: removeSourceEntry.bind(null, knex),
      isAgendaSource: isAgendaSource.bind(null, knex)
    }),
    task: task.bind(null, { queue })
  };
}


function task({ queue }) {
  queue.run();
}

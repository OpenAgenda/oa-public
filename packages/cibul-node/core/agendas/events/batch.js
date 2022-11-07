'use strict';

const _ = require('lodash');
const log = require('@openagenda/logs')('core/agendas/events/batch');

const list = require('./list');
const search = require('./search');
const update = require('./update');
const remove = require('./remove');

const { patch } = update;

const getTaskName = operation => `batched${_.capitalize(operation)}`;

async function agendaBatchSearch(core, agendaUid, operation, query, ...args) {
  const {
    tasks,
  } = core;
  const options = args[args.length - 1];
  const stream = await search(core, agendaUid, query, null, { ...options, stream: true });
  for await (const event of stream) {
    await tasks.enqueue.apply(null, [getTaskName(operation), agendaUid, event.uid].concat(args).flat());
  }
  log('done looping');
}

async function agendaBatchList(core, agendaUid, operation, query, ...args) {
  let lastId = 0;

  const {
    services,
    tasks,
  } = core;

  while (lastId !== -1) {
    const {
      events,
      lastId: nextLastId,
    } = await list(services, agendaUid, query, { lastId }, {
      load: {
        agendaEvent: true,
      },
      returnPayload: true,
    });

    for (const event of events) {
      await tasks.enqueue.apply(null, [getTaskName(operation), agendaUid, event.uid].concat(args).flat());
    }

    lastId = events.length ? nextLastId : -1;
  }
}

module.exports = core => {
  core.tasks.register({
    agendaBatchList: agendaBatchList.bind(null, core),
    agendaBatchSearch: agendaBatchSearch.bind(null, core),
    batchedPatch: (agendaUid, eventUid, data, options = {}) => patch(
      core,
      agendaUid,
      eventUid,
      data,
      { ...options, batched: true },
    ),
    batchedUpdate: (agendaUid, eventUid, data, options = {}) => update(
      core,
      agendaUid,
      eventUid,
      data,
      { ...options, batched: true },
    ),
    batchedRemove: (agendaUid, eventUid, options = {}) => remove(
      core.services,
      agendaUid,
      eventUid,
      { ...options, batched: true },
    ),
  });

  return (agendaUid, operation, query, ...args) => {
    const options = args[args.length - 1];

    const {
      search: useSearchIndex,
    } = {
      search: false,
      ...options,
    };

    return core.tasks.enqueue(useSearchIndex ? 'agendaBatchSearch' : 'agendaBatchList', agendaUid, operation, query, ...args);
  };
};

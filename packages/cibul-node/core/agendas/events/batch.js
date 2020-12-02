'use strict';

const _ = require('lodash');
const log = require('@openagenda/logs')('core/agendas/events/batch');

const tasks = require('../../tasks');
const list = require('./list');
const update = require('./update');
const remove = require('./remove');

const batchable = ['update', 'remove'];

module.exports = core => {
  core.tasks.register({
    agendaBatchList: agendaBatchList.bind(null, core),
    batchedUpdate: (agendaUid, eventUid, data, options = {}) => update(
      core.services, agendaUid, eventUid, data, { ...options, batched: true }
    ),
    batchedRemove: (agendaUid, eventUid, options = {}) => remove(
      core.services, agendaUid, eventUid, { ...options, batched: true }
    )
  });

  return (agendaUid, operation, query, ...args) => {
    return core.tasks.enqueue('agendaBatchList', agendaUid, operation, query, args);
  }
}

async function agendaBatchList(core, agendaUid, operation, query, ...args) {
  let lastId = 0;

  const {
    services,
    tasks
  } = core;

  while (lastId !== -1) {
    const {
      events,
      lastId: nextLastId
    } = await list(services, agendaUid, query, { lastId }, {
      load: {
        agendaEvent: true,
      },
      returnPayload: true
    });

    for (const event of events) {
      await tasks.enqueue.apply(null, ['batched' + _.capitalize(operation), agendaUid, event.uid].concat(args).flat());
    }

    lastId = events.length ? nextLastId : -1;
  }
}

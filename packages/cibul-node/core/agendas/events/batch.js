'use strict';

const _ = require('lodash');
const log = require('@openagenda/logs')('core/agendas/events/batch');

const tasks = require('../../tasks');
const list = require('./list');
const update = require('./update');
const remove = require('./remove');

const batchable = ['update', 'remove'];

tasks.register( {
  agendaBatchList,
  batchedUpdate,
  batchedRemove
} );

module.exports = async (agendaUid, operation, query, ...args) => {
  tasks.enqueue('agendaBatchList', agendaUid, operation, query, args);
}

async function agendaBatchList(agendaUid, operation, query, ...args) {
  let lastId = 0;

  while (lastId !== -1) {
    const {
      events,
      lastId: nextLastId
    } = await list(agendaUid, query, { lastId }, { load: { events: false, custom: false } });

    for (const event of events) {
      await tasks.enqueue.apply(null, ['batched' + _.capitalize(operation), agendaUid, event.uid].concat(args).flat());
    }

    lastId = events.length ? nextLastId : -1;
  }
}

function batchedUpdate(agendaUid, eventUid, data, options = {}) {
  return update(agendaUid, eventUid, data, Object.assign(options, { batched: true }));
}

function batchedRemove(agendaUid, eventUid, options = {}) {
  return remove(agendaUid, eventUid, Object.assign(options, { batched: true }));
}

"use strict";

const _ = require( 'lodash' );

const EventSearch = require('@openagenda/event-search');

const AgendaIndices = require('./agendaIndices');
const buildSearchConfig = require('./lib/buildSearchConfig');
const eventTransverseOperations = require('./eventTransverseOperations');

const log = require('@openagenda/logs')('services/eventSearch');

module.exports = {
  init,
  utils: EventSearch.utils
}

function init(config, services) {
  const {
    queues
  } = services;

  const eventSearch = EventSearch(buildSearchConfig(config));

  const queue = queues('eventSearch');

  const agendaIndices = AgendaIndices(eventSearch, config);

  return Object.assign(eventSearch, {
    agendas: agendaIndices,
    events: eventTransverseOperations({ eventSearch, agendaIndices, queue }),
    task: task.bind(null, { queue })
  });
}

function task({ queue }) {
  log('task');

  queue.on('error', (fn, args, error) => log('error', fn, args, error));
  queue.on('execute', (fn, args) => log(fn, 'execute'));
  queue.on('success', (fn, args, result) => log(fn, 'success'));

  queue.run();
}

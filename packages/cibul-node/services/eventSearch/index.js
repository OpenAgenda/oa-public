"use strict";

const _ = require('lodash');
const EventSearch = require('@openagenda/event-search');
const log = require('@openagenda/logs')('services/eventSearch');

const eventIndex = require('./lib/eventIndex');
const buildSearchConfig = require('./lib/buildSearchConfig');

const add = require('./add');
const update = require('./update');
const remove = require('./remove');
const agendaIndexSearch = require('./agendaIndexSearch');

module.exports.init = (config, services) => {
  log('init');
  const {
    queues,
    agendaEvents,
    core
  } = services;

  const eventSearch = EventSearch(buildSearchConfig(config));

  const queue = queues('eventSearch');

  eventIndex({ eventSearch, queue });

  return {
    task: task.bind(null, { queue }),
    update: update(services, queue, eventSearch),
    remove: remove(services, queue, eventSearch),
    add: add(services, queue, eventSearch),
    search: agendaIndexSearch.bind(null, eventSearch)
  };
}

function task({ queue }) {
  log('task');

  queue.on('error', (fn, args, error) => log('error', fn, args, error));
  queue.on('execute', (fn, args) => log(fn, 'execute'));
  queue.on('success', (fn, args, result) => log(fn, 'success'));

  queue.run();
}

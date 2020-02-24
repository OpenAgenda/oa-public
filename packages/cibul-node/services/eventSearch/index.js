"use strict";

const _ = require('lodash');
const EventSearch = require('@openagenda/event-search');
const log = require('@openagenda/logs')('services/eventSearch');

const add = require('./add');
const update = require('./update');
const remove = require('./remove');
const rebuild = require('./rebuild');
const agendaIndexSearch = require('./agendaIndexSearch');
const agendaIndexRebuild = require('./agendaIndexRebuild');
const transverseIndex = require('./transverseIndex');
const getApp = require('./getApp');

module.exports.init = async (config, services) => {
  log('init');
  const {
    queues,
    agendaEvents,
    core
  } = services;

  const node = _.get(config, 'es75.host', 'http://localhost:9200');
  const defaultIndex = _.get(config, 'es75.defaultIndex', process.env.NODE_ENV === 'production' ? 'main' : 'dev');

  log('using elasticsearch node %s, default index %s', node, defaultIndex);

  const eventSearch = EventSearch({
    elasticsearch: {
      node
    },
    defaultIndex,
    logger: config.getLogConfig('svc', 'eventSearch')
  });

  const queue = queues('eventSearch');
  const rebuildQueue = queues('eventSearch:rebuild');

  const transverseSearch = transverseIndex(services, eventSearch, queue);

  rebuildQueue.register({
    agenda: agenda => agendaIndexRebuild(services, eventSearch, agenda),
    transverse: options => queue('transverseIndexRebuild', options)
  });

  return {
    task: task.bind(null, { queue, rebuildQueue }),
    update: update(services, queue, eventSearch),
    remove: remove(services, queue, eventSearch),
    add: add(services, queue, eventSearch),
    rebuild: rebuild.bind(null, services, eventSearch, rebuildQueue),
    agendas: agenda => ({
      search: agendaIndexSearch.bind(null, eventSearch, agenda),
      rebuild: agendaIndexRebuild.bind(null, services, eventSearch, agenda)
    }),
    transverse: {
      rebuild: options => queue('transverseIndexRebuild', options),
      search: transverseSearch
    },
    getApp: getApp.bind(null, {
      services,
      transverseSearch,
      queue
    })
  };
}

function task({ queue, rebuildQueue }) {
  log('task');

  queue.on('error', (fn, args, error) => log('error', fn, args, error));
  queue.on('execute', (fn, args) => log(fn, 'execute'));
  queue.on('success', (fn, args, result) => log(fn, 'success'));

  queue.run();

  rebuildQueue.on('error', (fn, args, error) => log('error', fn, args, error));
  rebuildQueue.run();
}

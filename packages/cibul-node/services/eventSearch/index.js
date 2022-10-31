'use strict';

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
const transverseEventSearchApp = require('./transverseEventSearchApp');
const agendaRoutes = require('./agendaRoutes');

function task({ queue, rebuildQueue, updateMapping }) {
  log('task');

  queue.on('error', (fn, args, error) => log('error', fn, args, error));
  queue.on('execute', fn => log(fn, 'execute')); // (fn, args) => log(fn, 'execute'));
  queue.on('success', fn => log(fn, 'execute')); // (fn, args, result) => log(fn, 'success'));

  queue.run();

  rebuildQueue.on('error', (fn, args, error) => log('error', fn, args, error));
  rebuildQueue.run();

  updateMapping();
}

module.exports.init = async (config, services) => {
  log('init');
  const {
    queues,
    tracker,
  } = services;

  const port = _.get(config, 'es75.port', 9200);
  const protocol = _.get(config, 'es75.protocol', _.get(config, 'es75.ssl') ? 'https' : 'http');
  const host = _.get(config, 'es75.host', 'localhost');

  const node = `${protocol}://${host}:${port}`;

  const defaultIndex = _.get(config, 'es75.defaultIndex', process.env.NODE_ENV === 'production' ? 'main' : 'dev');

  log('using elasticsearch node %s, default index %s', node, defaultIndex);

  const eventSearch = EventSearch({
    elasticsearch: {
      node,
      ssl: _.get(config, 'es75.ssl'),
    },
    defaultIndex,
    logger: config.getLogConfig('svc', 'eventSearch'),
    interfaces: {
      onUpdate: ({ set }) => {
        tracker(`eventSearch.onUpdate.${set}`);
      },
    },
    emptyValue: 'null',
    assetsPath: config.aws.imageBucketPath,
    defaultImage: {
      filename: config.aws.defaultImagePath.split('/').pop(),
      size: config.aws.defaultImageSize,
      base: (() => {
        const parts = config.aws.defaultImagePath.split('/');
        parts.pop();
        return `${parts.join('/')}/`;
      })(),
    },
  });

  const queue = queues('eventSearch');
  const rebuildQueue = queues('eventSearch:rebuild');

  const transverseSearch = transverseIndex(services, eventSearch, queue);

  rebuildQueue.register({
    agenda: agenda => agendaIndexRebuild(services, eventSearch, agenda),
    transverse: options => queue('transverseIndexRebuild', options),
  });

  return {
    task: task.bind(null, { queue, rebuildQueue, updateMapping: eventSearch.updateMapping }),
    update: update(services, queue, eventSearch),
    remove: remove(services, queue, eventSearch),
    add: add(services, queue, eventSearch),
    rebuild: rebuild.bind(null, services, eventSearch, rebuildQueue),
    agendas: agenda => ({
      search: agendaIndexSearch(eventSearch, agenda),
      rebuild: agendaIndexRebuild.bind(null, services, eventSearch, agenda),
    }),
    transverse: {
      rebuild: options => queue('transverseIndexRebuild', options),
      search: transverseSearch,
    },
    apps: {
      events: transverseEventSearchApp.bind(null, services),
      agendas: agendaRoutes(services),
    },
    cluster: eventSearch.cluster,
  };
};

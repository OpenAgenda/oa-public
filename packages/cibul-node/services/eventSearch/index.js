import _ from 'lodash';
import EventSearch from '@openagenda/event-search';
import logs from '@openagenda/logs';
import add from './add.js';
import update from './update.js';
import remove from './remove.js';
import rebuild from './rebuild.js';
import agendaIndexSearch from './agendaIndexSearch.js';
import agendaIndexRebuild from './agendaIndexRebuild.js';
import transverseIndex from './transverseIndex.js';
import getAgendaSearchIndex from './lib/getAgendaSearchIndex.js';
import agendaRoutes from './agendaRoutes.js';
import { loadOtherUpdates, otherUpdate } from './lib/otherUpdates.js';

const log = logs('services/eventSearch');

async function task({
  queue,
  rebuildQueue,
  updateMapping,
  updateDynamicSettings,
}) {
  log('task');

  queue.on('error', (fn, args, error) => {
    if (error.statusCode === 404) {
      log('warn', fn, args, error);
    } else {
      log('error', fn, args, error);
    }
  });
  queue.on('execute', (fn) => log(fn, 'execute')); // (fn, args) => log(fn, 'execute'));
  queue.on('success', (fn) => log(fn, 'success')); // (fn, args, result) => log(fn, 'success'));

  queue.run();

  rebuildQueue.on('error', (fn, args, error) => log('error', fn, args, error));
  rebuildQueue.run();

  await updateMapping();
  await updateDynamicSettings();
}

export async function init(config, services) {
  log('init');
  const { queues, tracker } = services;

  const port = _.get(config, 'es75.port', 9200);
  const protocol = _.get(
    config,
    'es75.protocol',
    _.get(config, 'es75.ssl') ? 'https' : 'http',
  );
  const host = _.get(config, 'es75.host', 'localhost');

  const node = `${protocol}://${host}:${port}`;

  log(
    'using elasticsearch node %s, default index %s',
    node,
    config.es75.agendaEventsIndex,
  );

  const eventSearch = EventSearch({
    elasticsearch: {
      node,
      ssl: _.get(config, 'es75.ssl'),
    },
    defaultIndex: config.es75.agendaEventsIndex,
    logger: config.getLogConfig('svc', 'eventSearch'),
    interfaces: {
      onUpdate: ({ set }) => {
        tracker(`eventSearch.onUpdate.${set}`);
      },
    },
    emptyValue: 'null',
    assetsPath: config.s3.mainBucketPath,
    dynamicSettings: {
      max_result_window: 30000,
    },
    defaultImage: {
      filename: config.s3.defaultImagePath.split('/').pop(),
      size: config.s3.defaultImageSize,
      base: (() => {
        const parts = config.s3.defaultImagePath.split('/');
        parts.pop();
        return `${parts.join('/')}/`;
      })(),
    },
  });

  const queue = queues('eventSearch');
  const rebuildQueue = queues('eventSearch:rebuild');

  const transverseSearch = transverseIndex(
    { services, config },
    eventSearch,
    queue,
  );

  rebuildQueue.register({
    agenda: (agenda) => agendaIndexRebuild(services, eventSearch, agenda),
    transverse: (options) => queue('transverseIndexRebuild', options),
  });

  queue.register({
    loadOtherUpdates: loadOtherUpdates.bind(null, services, queue),
    otherUpdate: otherUpdate.bind(null, services, eventSearch),
  });

  return {
    task: task.bind(null, {
      queue,
      rebuildQueue,
      updateMapping: eventSearch.updateMapping,
      updateDynamicSettings: eventSearch.updateDynamicSettings,
    }),
    update: update(services, queue, eventSearch),
    remove: remove(services, queue, eventSearch),
    add: add(services, queue, eventSearch),
    rebuild: rebuild.bind(null, services, rebuildQueue),
    agendas: (agenda) => ({
      search: agendaIndexSearch(eventSearch, agenda),
      rebuild: agendaIndexRebuild.bind(null, services, eventSearch, agenda),
      clear: getAgendaSearchIndex(eventSearch, agenda.uid).clear,
    }),
    transverse: {
      rebuild: (options) => queue('transverseIndexRebuild', options),
      search: transverseSearch,
    },
    shutdown: async (options) => {
      await queue.stop({ clear: options.clear });
      await rebuildQueue.stop({ clear: options.clear });
    },
    apps: {
      agendas: agendaRoutes(config, services),
    },
    cluster: eventSearch.cluster,
    getConfig: eventSearch.getConfig,
  };
}

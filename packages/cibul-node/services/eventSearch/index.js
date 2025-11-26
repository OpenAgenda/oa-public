import _ from 'lodash';
import EventSearch from '@openagenda/event-search';
import logs from '@openagenda/logs';
import add from './add.js';
import update from './update.js';
import remove, { removeFromAgendaIndex } from './remove.js';
import rebuild from './rebuild.js';
import agendaIndexSearch from './agendaIndexSearch.js';
import agendaIndexRebuild from './agendaIndexRebuild.js';
import {
  transverseIndexRebuild,
  transverseIndexRemove,
  transverseIndexUpdate,
} from './transverseIndex.js';
import getAgendaSearchIndex from './lib/getAgendaSearchIndex.js';
import agendaRoutes from './agendaRoutes.js';
import { loadOtherUpdates, otherUpdate } from './lib/otherUpdates.js';

const log = logs('services/eventSearch');

async function task({
  worker,
  rebuildWorker,
  updateMapping,
  updateDynamicSettings,
}) {
  log('task');

  worker.on('error', (failedReason) => log.error('error', failedReason));
  worker.on('failed', (job, error) => {
    if (error.statusCode === 404) {
      log.warn(job.name, job.data, error);
    } else {
      log.error(job.name, job.data, error);
    }
  });
  worker.on('active', (job) => log.info(job.name, 'execute'));
  worker.on('completed', (job, _result, _prev) =>
    log.info(job.name, 'success'));
  worker.run();

  rebuildWorker.on('error', (failedReason) => log.error('error', failedReason));
  rebuildWorker.on('failed', (job, error) =>
    log.error(job.name, job.data, error));
  rebuildWorker.run();

  await updateMapping();
  await updateDynamicSettings();
}

export async function init(config, services) {
  log('init');
  const { bull, tracker } = services;

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

  const transverseIndex = eventSearch('events');

  const queue = new bull.Queue('eventSearch', { prefix: '{eventSearch}' });
  const worker = new bull.Worker(
    queue.name,
    (job) => {
      switch (job.name) {
        case 'loadOtherUpdates':
          return loadOtherUpdates(services, queue, job.data);
        case 'otherUpdate':
          return otherUpdate(services, eventSearch, job.data);
        case 'removeFromAgendaIndex':
          return removeFromAgendaIndex(eventSearch, job.data);
        case 'transverseIndexRebuild':
          return transverseIndexRebuild(services, transverseIndex, job.data);
        case 'transverseIndexUpdate':
          return transverseIndexUpdate(
            config,
            services,
            transverseIndex,
            job.data,
          );
        case 'transverseIndexRemove':
          return transverseIndexRemove(
            config,
            services,
            transverseIndex,
            job.data,
          );
        default:
          log.warn(`Unknown job ${job.name}`);
      }
    },
    {
      prefix: queue.opts.prefix,
      autorun: false,
      removeOnComplete: {
        age: 3600, // keep up to 1 hour
        count: 1000, // keep up to 1000 jobs
      },
      removeOnFail: {
        age: 7 * 24 * 3600, // keep up to 7 days
        count: 1000, // keep up to 1000 jobs
      },
    },
  );

  const rebuildQueue = new bull.Queue('eventSearch-rebuild', {
    prefix: '{eventSearch-rebuild}',
  });
  const rebuildWorker = new bull.Worker(
    rebuildQueue.name,
    (job) => {
      switch (job.name) {
        case 'agenda':
          return agendaIndexRebuild(services, eventSearch, job.data);
        case 'transverse':
          return queue.add('transverseIndexRebuild', job.data);
        default:
          log.warn(`Unknown job ${job.name}`);
      }
    },
    {
      prefix: rebuildQueue.opts.prefix,
      autorun: false,
      removeOnComplete: {
        age: 3600, // keep up to 1 hour
        count: 1000, // keep up to 1000 jobs
      },
      removeOnFail: {
        age: 7 * 24 * 3600, // keep up to 7 days
        count: 1000, // keep up to 1000 jobs
      },
    },
  );

  const service = {
    task: task.bind(null, {
      worker,
      rebuildWorker,
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
      rebuild: (options) => queue.add('transverseIndexRebuild', options),
      search: transverseIndex.search,
    },
    shutdown: async (options) => {
      if (options.clear) {
        await queue.drain();
        await rebuildQueue.drain();
      }

      await worker.close();
      await rebuildWorker.close();

      await service.getConfig().client.close();
    },
    apps: {
      agendas: agendaRoutes(config, services),
    },
    cluster: eventSearch.cluster,
    getConfig: eventSearch.getConfig,
  };

  return service;
}

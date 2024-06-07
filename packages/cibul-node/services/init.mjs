import { createRequire } from 'node:module';
import debug from 'debug';
import VError from '@openagenda/verror';
import logs from '@openagenda/logs';
import schema from '@openagenda/validators/schema/index.js';
import passValidator from '@openagenda/validators/pass.js';

import './lib/loadGlobalEnvVars.mjs';

const require = createRequire(import.meta.url);

const log = logs('services/init');

schema.register({
  pass: passValidator,
});

const validateOptions = schema({
  enabled: {
    list: true,
    type: 'pass',
  },
  disabled: {
    list: true,
    type: 'pass',
  },
});

const color = (nbr, str) => `\x1b[3${nbr}m${str}\x1b[0m`;

function isServiceEnabled(options, name) {
  if (!options.enabled.length) {
    return true;
  }
  return options.enabled.includes(name);
}

function isServiceDisabled(options, name) {
  if (!options.disabled.length) {
    return false;
  }
  return options.disabled.includes(name);
}

function createInitier(config, options) {
  const services = {};
  return Object.assign(async (name, serviceImporter) => {
    if (options.enabled && !isServiceEnabled(options, name)) {
      return;
    }
    if (options.disabled && isServiceDisabled(options, name)) {
      return;
    }

    const service = await serviceImporter();

    if (typeof service.init !== 'function') {
      log('warn', '%s: missing init', name);
      return;
    }

    try {
      const svc = await service.init(config, services);
      if (svc) services[name] = svc;
      log('info', name);
    } catch (err) {
      throw new VError(err, `service '${name}' initialization did not go well`);
    }
  }, { services });
}

function applyShutdown(services) {
  services.shutdown = async (options = {}) => {
    for (const name of Object.keys(services).reverse()) {
      const service = services[name];
      if (service.shutdown) {
        log('shutting down %s', name);
        await service.shutdown(options);
      }
    }
  };
  return services;
}

export default async function initServices(config = null, options = {}) {
  const t = new Date();

  const cleanOptions = validateOptions({ ...config, ...options });

  log('-- initialization started --');

  const init = createInitier(config, cleanOptions);

  // init services

  await init('knex', () => import('./knex.mjs'));
  await init('redis', () => import('./redis.mjs'));
  await init('bull', () => import('./bull/index.mjs'));
  await init('errors', () => require('./errors.js'));
  await init('tracker', () => import('./tracker.mjs'));
  await init('genUrl', () => import('./genUrl.mjs'));
  await init('queues', () => import('./queues.mjs'));
  await init('discord', () => import('./discord.mjs'));
  await init('files', () => import('./files.mjs'));
  await init('abilities', () => import('./abilities/index.mjs'));
  await init('keys', () => import('./keys.mjs'));
  await init('users', () => import('./users/index.mjs'));
  await init('accessTokens', () => import('./accessTokens/index.mjs'));
  await init('activities', () => require('./activities/index.js')); // required directly
  await init('activityApps', () => import('./activityApps.mjs'));
  await init('members', () => require('./members/index.js')); // required directly
  await init('agendaContribute', () => import('./agendaContribute/index.mjs'));
  await init('agendaDocx', () => import('./agendaDocx.mjs'));
  await init('agendaEvents', () => import('./agendaEvents/index.mjs'));
  await init('geocoder', () => import('./geocoder.mjs'));
  await init('agendaLocations', () => require('./agendaLocations/index.js'));
  await init('agendaSettings', () => require('./agendaSettings.js'));
  await init('inboxes', () => require('./inboxes/index.js'));
  await init('agendaStatistics', () => require('./agendaStatistics/index.js'));
  await init('agendas', () => require('./agendas/index.js'));
  await init('agendaSearch', () => require('./agendaSearch/index.js'));
  await init('adminAgendas', () => require('./adminAgendas.js'));
  await init('aggregators', () => require('./aggregators/index.js'));
  await init('cache', () => require('./cache/index.js'));
  await init('eventSearch', () => require('./eventSearch/index.js'));
  await init('events', () => require('./events/index.js'));
  await init('facebook', () => require('./facebook.js'));
  await init('formSchemas', () => import('./formSchemas.mjs'));
  await init('registrations', () => import('./registrations/index.mjs'));
  await init('pdfExports', () => import('./pdfExports.mjs'));
  await init('custom', () => require('./custom/index.js'));
  await init('invitations', () => require('./invitations.js'));
  await init('legacy', () => require('./legacy.js'));
  await init('logRequests', () => import('./logRequests.mjs'));
  await init('unsubscriptions', () => import('./unsubscriptions.mjs'));
  await init('security', () => import('./security.mjs'));
  await init('mails', () => import('./mails/index.mjs'));
  await init('model', () => require('./model/index.js'));
  await init('sessions', () => require('./sessions/index.js'));
  await init('networkApps', () => require('./networkApps.js'));
  await init('networks', () => require('./networks.js'));
  await init('newsletter', () => require('./newsletter.js'));
  await init('oembed', () => require('./oembed.js'));
  await init('simpleCache', () => import('./simpleCache.mjs'));
  await init('supervisor', () => require('./supervisor/index.js'));
  await init('stats', () => import('./stats/index.mjs'));
  await init('reports', () => import('./reports.mjs'));
  await init('dynamicScripts', () => import('./dynamicScripts.mjs'));
  await init('usageCounters', () => import('./usageCounters/index.mjs'));

  const timeDiff = new Date().getTime() - t.getTime();

  log(`initialized in ${debug.useColors() ? color(3, timeDiff) : timeDiff}ms`);

  return applyShutdown(init.services);
}

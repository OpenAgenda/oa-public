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
  await init('errors', () => import('./errors.mjs'));
  await init('tracker', () => import('./tracker.mjs'));
  await init('genUrl', () => import('./genUrl.mjs'));
  await init('queues', () => import('./queues.mjs'));
  await init('discord', () => import('./discord.mjs'));
  await init('files', () => import('./files.mjs'));
  await init('abilities', () => import('./abilities/index.mjs'));
  await init('keys', () => import('./keys.mjs'));
  await init('users', () => import('./users/index.mjs'));
  await init('accessTokens', () => import('./accessTokens/index.mjs'));
  await init('activities', () => import('./activities/index.mjs')); // required directly
  await init('activityApps', () => import('./activityApps.mjs'));
  await init('members', () => import('./members/index.mjs')); // required directly
  await init('agendaContribute', () => import('./agendaContribute/index.mjs'));
  await init('agendaDocx', () => import('./agendaDocx.mjs'));
  await init('agendaEvents', () => import('./agendaEvents/index.mjs'));
  await init('geocoder', () => import('./geocoder.mjs'));
  await init('agendaLocations', () => import('./agendaLocations/index.mjs'));
  await init('agendaSettings', () => import('./agendaSettings.mjs'));
  await init('inboxes', () => import('./inboxes/index.mjs'));
  await init('agendaStatistics', () => import('./agendaStatistics/index.mjs'));
  await init('agendas', () => import('./agendas/index.mjs'));
  await init('agendaSearch', () => import('./agendaSearch/index.mjs'));
  await init('adminAgendas', () => import('./adminAgendas.mjs'));
  await init('aggregators', () => import('./aggregators/index.mjs'));
  await init('cache', () => import('./cache/index.mjs')); // required directly
  await init('eventSearch', () => import('./eventSearch/index.mjs'));
  await init('events', () => import('./events/index.mjs'));
  await init('facebook', () => import('./facebook.mjs'));
  await init('formSchemas', () => import('./formSchemas.mjs'));
  await init('registrations', () => import('./registrations/index.mjs'));
  await init('pdfExports', () => import('./pdfExports.mjs'));
  await init('custom', () => import('./custom/index.mjs'));
  await init('invitations', () => import('./invitations.mjs'));
  await init('legacy', () => import('./legacy.mjs')); // required directly
  await init('logRequests', () => import('./logRequests.mjs'));
  await init('unsubscriptions', () => import('./unsubscriptions.mjs'));
  await init('security', () => import('./security.mjs'));
  await init('mails', () => import('./mails/index.mjs'));
  await init('sessions', () => import('./sessions/index.mjs'));
  await init('networkApps', () => import('./networkApps.mjs'));
  await init('networks', () => import('./networks.mjs'));
  await init('newsletter', () => import('./newsletter.mjs'));
  await init('oembed', () => import('./oembed.mjs'));
  await init('simpleCache', () => import('./simpleCache.mjs'));
  await init('supervisor', () => import('./supervisor/index.mjs'));
  await init('stats', () => import('./stats/index.mjs'));
  await init('reports', () => import('./reports.mjs'));
  await init('dynamicScripts', () => import('./dynamicScripts.mjs'));
  await init('usageCounters', () => import('./usageCounters/index.mjs'));

  const timeDiff = new Date().getTime() - t.getTime();

  log(`initialized in ${debug.useColors() ? color(3, timeDiff) : timeDiff}ms`);

  return applyShutdown(init.services);
}

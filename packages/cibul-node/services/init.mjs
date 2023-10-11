import { createRequire } from 'node:module';
import debug from 'debug';
import VError from '@openagenda/verror';
import logs from '@openagenda/logs';
import schema from '@openagenda/validators/schema/index.js';
import passValidator from '@openagenda/validators/pass.js';

import './lib/loadGlobalEnvVars.mjs';
import * as knex from './knex.mjs';
import * as redis from './redis.mjs';
import * as bull from './bull/index.mjs';
import * as formSchemas from './formSchemas.mjs';
import * as registrations from './registrations.mjs';

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
  return Object.assign((name, service) => {
    if (options.enabled && !isServiceEnabled(options, name)) {
      return;
    }
    if (options.disabled && isServiceDisabled(options, name)) {
      return;
    }

    if (typeof service.init !== 'function') {
      log('warn', '%s: missing init', name);
      return;
    }

    return Promise.resolve(service.init(config, services))
      .then(svc => {
        if (svc) services[name] = svc;
        log('info', name);
      })
      .catch(err => {
        throw new VError(err, `service '${name}' initialization did not go well`);
      });
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

  await init('knex', knex);
  await init('redis', redis);
  await init('bull', bull);
  await init('errors', require('./errors.js'));
  await init('tracker', require('./tracker.js'));
  await init('queues', require('./queues.js'));
  await init('discord', require('./discord.js'));
  await init('files', require('./files.js'));
  await init('abilities', require('./abilities/index.js'));
  await init('keys', require('./keys.js'));
  await init('users', require('./users/index.js'));
  await init('accessTokens', require('./accessTokens/index.js'));
  await init('activities', require('./activities/index.js'));
  await init('activityApps', require('./activityApps.js'));
  await init('members', require('./members/index.js'));
  await init('agendaContribute', require('./agendaContribute/index.js'));
  await init('agendaDocx', require('./agendaDocx.js'));
  await init('agendaEvents', require('./agendaEvents/index.js'));
  await init('geocoder', require('./geocoder.js'));
  await init('agendaLocations', require('./agendaLocations/index.js'));
  await init('agendaSettings', require('./agendaSettings.js'));
  await init('inboxes', require('./inboxes/index.js'));
  await init('agendaStatistics', require('./agendaStatistics/index.js'));
  await init('agendas', require('./agendas/index.js'));
  await init('agendaSearch', require('./agendaSearch/index.js'));
  await init('adminAgendas', require('./adminAgendas.js'));
  await init('aggregators', require('./aggregators/index.js'));
  await init('cache', require('./cache/index.js'));
  await init('eventSearch', require('./eventSearch/index.js'));
  await init('events', require('./events/index.js'));
  await init('facebook', require('./facebook.js'));
  await init('formSchemas', formSchemas);
  await init('registrations', registrations);
  await init('custom', require('./custom/index.js'));
  await init('genUrl', require('./genUrl/index.js'));
  await init('invitations', require('./invitations.js'));
  await init('legacy', require('./legacy.js'));
  await init('logRequests', require('./logRequests.js'));
  await init('mails', require('./mails/index.js'));
  await init('model', require('./model/index.js'));
  await init('sessions', require('./sessions.js'));
  await init('networkApps', require('./networkApps.js'));
  await init('networks', require('./networks.js'));
  await init('newsletter', require('./newsletter.js'));
  await init('oembed', require('./oembed.js'));
  await init('simpleCache', require('./simpleCache.js'));
  await init('unsubscribed', require('./unsubscribed.js'));
  await init('supervisor', require('./supervisor/index.js'));
  await init('stats', require('./stats/index.js'));
  await init('reports', require('./reports.js'));
  await init('dynamicScripts', require('./dynamicScripts.js'));

  const timeDiff = new Date().getTime() - t.getTime();

  log(`initialized in ${debug.useColors() ? color(3, timeDiff) : timeDiff}ms`);

  return applyShutdown(init.services);
}

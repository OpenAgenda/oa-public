import debug from 'debug';
import VError from '@openagenda/verror';
import logs from '@openagenda/logs';
import schema from '@openagenda/validators/schema/index.js';
import passValidator from '@openagenda/validators/pass.js';

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
  return Object.assign(
    async (name, serviceImporter) => {
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
        throw new VError(
          err,
          `service '${name}' initialization did not go well`,
        );
      }
    },
    { services },
  );
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

  await init('knex', () => import('./knex.js'));
  await init('redis', () => import('./redis.js'));
  await init('bull', () => import('./bull/index.js'));
  await init('errors', () => import('./errors.js'));
  await init('tracker', () => import('./tracker.js'));
  await init('genUrl', () => import('./genUrl.js'));
  await init('discord', () => import('./discord.js'));
  await init('files', () => import('./files.js'));
  await init('abilities', () => import('./abilities/index.js'));
  await init('keys', () => import('./keys.js'));
  await init('users', () => import('./users/index.js'));
  await init('accessTokens', () => import('./accessTokens/index.js'));
  await init('activities', () => import('./activities/index.js')); // required directly
  await init('members', () => import('./members/index.js')); // required directly
  await init('agendaContribute', () => import('./agendaContribute/index.js'));
  await init('agendaDocx', () => import('./agendaDocx.js'));
  await init('agendaEvents', () => import('./agendaEvents/index.js'));
  await init('geocoder', () => import('./geocoder.js'));
  await init('agendaLocations', () => import('./agendaLocations/index.js'));
  await init('agendaSettings', () => import('./agendaSettings.js'));
  await init('inboxes', () => import('./inboxes/index.js'));
  await init('agendaStatistics', () => import('./agendaStatistics/index.js'));
  await init('agendas', () => import('./agendas/index.js'));
  await init('agendaSearch', () => import('./agendaSearch/index.js'));
  await init('aggregators', () => import('./aggregators/index.js'));
  await init('cache', () => import('./cache/index.js')); // required directly
  await init('eventSearch', () => import('./eventSearch/index.js'));
  await init('events', () => import('./events/index.js'));
  await init('formSchemas', () => import('./formSchemas.js'));
  await init('registrations', () => import('./registrations/index.js'));
  await init('pdfExports', () => import('./pdfExports.js'));
  await init('custom', () => import('./custom/index.js'));
  await init('invitations', () => import('./invitations.js'));
  await init('logRequests', () => import('./logRequests.js'));
  await init('unsubscriptions', () => import('./unsubscriptions.js'));
  await init('security', () => import('./security.js'));
  await init('mails', () => import('./mails/index.js'));
  await init('sessions', () => import('./sessions/index.js'));
  await init('networkApps', () => import('./networkApps.js'));
  await init('networks', () => import('./networks.js'));
  await init('newsletter', () => import('./newsletter.js'));
  await init('oembed', () => import('./oembed.js'));
  await init('simpleCache', () => import('./simpleCache.js'));
  await init('supervisor', () => import('./supervisor/index.js'));
  await init('superadmin', () => import('./superadmin/index.js'));
  await init('stats', () => import('./stats/index.js'));
  await init('reports', () => import('./reports.js'));
  await init('dynamicScripts', () => import('./dynamicScripts.js'));
  await init('usageCounters', () => import('./usageCounters/index.js'));

  const timeDiff = new Date().getTime() - t.getTime();

  log(`initialized in ${debug.useColors() ? color(3, timeDiff) : timeDiff}ms`);

  return applyShutdown(init.services);
}

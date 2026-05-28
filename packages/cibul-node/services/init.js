import debug from 'debug';
import VError from '@openagenda/verror';
import logs from '@openagenda/logs';
import schema from '@openagenda/validators/schema/index';
import passValidator from '@openagenda/validators/pass';

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

const registry = [
  { name: 'knex', load: () => import('./knex.js') },
  { name: 'redis', load: () => import('./redis.js') },
  { name: 'auth', load: () => import('./auth/index.js') },
  { name: 'bull', load: () => import('./bull/index.js') },
  { name: 'errors', load: () => import('./errors.js') },
  { name: 'tracker', load: () => import('./tracker.js') },
  { name: 'genUrl', load: () => import('./genUrl.js') },
  { name: 'discord', load: () => import('./discord.js') },
  { name: 'files', load: () => import('./files.js') },
  { name: 'abilities', load: () => import('./abilities/index.js') },
  { name: 'users', load: () => import('./users/index.js') },
  { name: 'accessTokens', load: () => import('./accessTokens/index.js') },
  { name: 'activities', load: () => import('./activities/index.js') },
  { name: 'members', load: () => import('./members/index.js') },
  {
    name: 'agendaContribute',
    load: () => import('./agendaContribute/index.js'),
  },
  { name: 'agendaDocx', load: () => import('./agendaDocx.js') },
  { name: 'agendaEvents', load: () => import('./agendaEvents/index.js') },
  { name: 'geocoder', load: () => import('./geocoder.js') },
  { name: 'agendaLocations', load: () => import('./agendaLocations/index.js') },
  { name: 'agendas', load: () => import('./agendas/index.js') },
  { name: 'inboxes', load: () => import('./inboxes/index.js') },
  {
    name: 'agendaStatistics',
    load: () => import('./agendaStatistics/index.js'),
  },
  { name: 'agendaSearch', load: () => import('./agendaSearch/index.js') },
  { name: 'aggregators', load: () => import('./aggregators/index.js') },
  { name: 'eventSearch', load: () => import('./eventSearch/index.js') },
  { name: 'events', load: () => import('./events/index.js') },
  { name: 'formSchemas', load: () => import('./formSchemas.js') },
  { name: 'registrations', load: () => import('./registrations/index.js') },
  { name: 'pdfExports', load: () => import('./pdfExports.js') },
  { name: 'custom', load: () => import('./custom/index.js') },
  { name: 'invitations', load: () => import('./invitations.js') },
  { name: 'logRequests', load: () => import('./logRequests.js') },
  { name: 'unsubscriptions', load: () => import('./unsubscriptions.js') },
  { name: 'security', load: () => import('./security.js') },
  { name: 'mails', load: () => import('./mails/index.js') },
  {
    name: 'behavioralEmails',
    load: () => import('./behavioralEmails/index.js'),
  },
  { name: 'networkApps', load: () => import('./networkApps.js') },
  { name: 'networks', load: () => import('./networks.js') },
  { name: 'newsletter', load: () => import('./newsletter.js') },
  { name: 'oembed', load: () => import('./oembed.js') },
  { name: 'simpleCache', load: () => import('./simpleCache.js') },
  { name: 'supervisor', load: () => import('./supervisor/index.js') },
  { name: 'superadmin', load: () => import('./superadmin/index.js') },
  { name: 'stats', load: () => import('./stats/index.js') },
  { name: 'reports', load: () => import('./reports.js') },
  { name: 'dynamicScripts', load: () => import('./dynamicScripts.js') },
  { name: 'usageCounters', load: () => import('./usageCounters/index.js') },
  { name: 'monitor', load: () => import('./monitor.js') },
];

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

function filterServices(config, options = {}) {
  const cleanOptions = validateOptions({ ...config, ...options });
  return registry.filter(
    (entry) =>
      isServiceEnabled(cleanOptions, entry.name)
      && !isServiceDisabled(cleanOptions, entry.name),
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

  log('-- initialization started --');

  const services = {};
  const retained = filterServices(config, options);

  for (const entry of retained) {
    const service = await entry.load();

    if (typeof service.init !== 'function') {
      log('warn', '%s: missing init', entry.name);
      continue;
    }

    try {
      const svc = await service.init(config, services);
      if (svc) services[entry.name] = svc;
      log('info', entry.name);
    } catch (err) {
      throw new VError(
        err,
        `service '${entry.name}' initialization did not go well`,
      );
    }
  }

  const timeDiff = new Date().getTime() - t.getTime();

  log(`initialized in ${debug.useColors() ? color(3, timeDiff) : timeDiff}ms`);

  return applyShutdown(services);
}

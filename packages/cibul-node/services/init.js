'use strict';

global.__CLIENT__ = false;
global.__SERVER__ = true;
global.__DEVELOPMENT__ = process.env.NODE_ENV !== 'production';

const debug = require('debug');
const VError = require('verror');
const logs = require('@openagenda/logs');
const schema = require('@openagenda/validators/schema');

schema.register({
  pass: require('@openagenda/validators/pass')
});

const validateOptions = schema({
  enabled: {
    list: true,
    type: 'pass'
  }
});

const color = (nbr, str) => `\x1b[3${nbr}m${str}\x1b[0m`;

let log;

module.exports = async function (configObject, options = {}) {

  const t = new Date();
  const config = configObject || require('../config');

  const cleanOptions = validateOptions(options);

  logs.init(config.logger || config.getLogConfig('oa', 'oa', false));

  log = logs('services/init');

  log('-- initialization started --');

  const init = createInitier(config, cleanOptions);

  // init services

  await init('knex', require('./knex'));
  await init('redis', require('./redis'));
  await init('rateLimit', require('./rateLimit'));
  await init('errors', require('./errors'));
  await init('tracker', require('./tracker'));
  await init('redisConfigStore', require('./redisConfigStore'));
  await init('queues', require('./queues'));
  await init('discord', require ('./discord'));
  await init('files', require('./files'));
  await init('users', require('./users'));
  await init('abilities', require('./abilities'));
  await init('accessTokens', require('./accessTokens'));
  await init('activities', require('./activities'));
  await init('activityApps', require('./activityApps'));
  await init('members', require('./members'));
  await init('agendaCalendar', require('./agendaCalendar'));
  await init('agendaContribute', require('./agendaContribute'));
  await init('agendaDocx', require('./agendaDocx'));
  await init('agendaEvents', require('./agendaEvents'));
  await init('geocoder', require('./geocoder'));
  await init('agendaLocations', require('./agendaLocations'));
  await init('agendaSettings', require('./agendaSettings'));
  await init('inboxes', require('./inboxes'));
  await init('agendaStatistics', require('./agendaStatistics'));
  await init('agendas', require('./agendas'));
  await init('agendaSearch', require('./agendaSearch'));
  await init('adminAgendas', require('./adminAgendas'));
  await init('aggregators', require('./aggregators'));
  await init('cache', require('./cache'));
  await init('elasticsearch', require('./elasticsearch'));
  await init('eventSearch', require('./eventSearch'));
  await init('events', require('./events'));
  await init('facebook', require('./facebook'));
  await init('formSchemas', require('./formSchemas'));
  await init('custom', require('./custom'));
  await init('genUrl', require('./genUrl'));
  await init('invitations', require('./invitations'));
  await init('keys', require('./keys'));
  await init('legacy', require('./legacy'));
  await init('logRequests', require('./logRequests'));
  await init('mails', require('./mails'));
  await init('model', require('./model'));
  await init('sessions', require('./sessions'));
  await init('networkApps', require('./networkApps'));
  await init('networks', require('./networks'));
  await init('newsletter', require('./newsletter'));
  await init('oembed', require('./oembed'));
  await init('simpleCache', require('./simpleCache'));
  await init('unsubscribed', require('./unsubscribed'));
  await init('agendaSchema', require('./agendaSchema'));
  await init('supervisor', require('./supervisor'));
  await init('stats', require('./stats'));

  const timeDiff = new Date().getTime() - t.getTime();

  log(`initialized in ${debug.useColors() ? color(3, timeDiff) : timeDiff}ms`);

  return applyShutdown(init.services);
};

function applyShutdown(services) {
  services.shutdown = async (options = {}) => {
    for (const name of Object.keys(services).reverse()) {
      const service = services[name];
      if (service.shutdown) {
        log('shutting down %s', name);
        await service.shutdown(options);
      }
    }
  }
  return services;
}

function createInitier(config, options) {
  const services = {};
  return Object.assign((name, service) => {
    if (options.enabled && options.enabled.length && !options.enabled.includes(name)) {
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

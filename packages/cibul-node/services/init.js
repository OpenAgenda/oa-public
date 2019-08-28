"use strict";

global.__CLIENT__ = false;
global.__SERVER__ = true;
global.__DEVELOPMENT__ = process.env.NODE_ENV !== 'production';

const debug = require('debug');
const VError = require('verror');
const logs = require('@openagenda/logs');
const schema = require('@openagenda/validators/schema');
const app = require('../app');


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

  await init('errors', require('./errors'));
  await init('queues', require('./queues'));
  await init('users', require('./users'));
  await init('abilities', require('./abilities'));
  await init('accessTokens', require('./accessTokens'));
  await init('activities', require('./activities'));
  await init('activityApps', require('./activityApps'));
  await init('adminAgendas', require('./adminAgendas'));
  await init('agendaCalendar', require('./agendaCalendar'));
  await init('agendaCategories', require('./agendaCategories'));
  await init('agendaContribute', require('./agendaContribute'));
  await init('agendaDocx', require('./agendaDocx'));
  await init('agendaEventReferences', require('./agendaEventReferences'));
  await init('agendaEvents', require('./agendaEvents'));
  await init('agendaLocations', require('./agendaLocations'));
  await init('agendaMonitor', require('./agendaMonitor'));
  await init('agendaSchema', require('./agendaSchema'));
  await init('agendaSearch', require('./agendaSearch'));
  await init('agendaSettings', require('./agendaSettings'));
  await init('agendaStakeholders', require('./agendaStakeholders'));
  await init('agendaStatistics', require('./agendaStatistics'));
  await init('agendaTags', require('./agendaTags'));
  await init('agendas', require('./agendas'));
  await init('aggregator', require('./aggregator'));
  await init('aggregatorSources', require('./aggregatorSources'));
  await init('cache', require('./cache'));
  await init('callToAction', require('./callToAction'));
  await init('custom', require('./custom'));
  await init('elasticsearch', require('./elasticsearch'));
  await init('emailStrategie', require('./emailStrategie'));
  await init('eventSearch', require('./eventSearch'));
  await init('events', require('./events'));
  await init('facebook', require('./facebook'));
  await init('files', require('./files'));
  await init('formSchemas', require('./formSchemas'));
  await init('genUrl', require('./genUrl'));
  await init('home', require('./home'));
  await init('imageFiles', require('./imageFiles'));
  await init('images', require('./images'));
  await init('inboxes', require('./inboxes'));
  await init('invitations', require('./invitations'));
  await init('keys', require('./keys'));
  await init('legacy', require('./legacy'));
  await init('logRequests', require('./logRequests'));
  await init('mails', require('./mails'));
  await init('members', require('./members'));
  await init('model', require('./model'));
  await init('networkApps', require('./networkApps'));
  await init('networks', require('./networks'));
  await init('newsletter', require('./newsletter'));
  await init('oembed', require('./oembed'));
  await init('portals', require('./portals'));
  await init('sessions', require('./sessions'));
  await init('simpleCache', require('./simpleCache'));
  await init('surveys', require('./surveys'));
  await init('unsubscribed', require('./unsubscribed'));

  const timeDiff = new Date().getTime() - t.getTime();

  log(`initialized in ${debug.useColors() ? color(3, timeDiff) : timeDiff}ms`);
}


function createInitier(config, options) {
  return (name, service) => {
    if (options.enabled && options.enabled.length && !options.enabled.includes(name)) {
      return;
    }

    if (typeof service.init !== 'function') {
      log('warn', '%s: missing init', name);
      return;
    }

    return Promise.resolve(service.init(config, app))
      .then( () => {
        log('info', name);
      })
      .catch(err => {
        throw new VError(err, `service '${name}'initialization did not go well`);
      });
  };
}

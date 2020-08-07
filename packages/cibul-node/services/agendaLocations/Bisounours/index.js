'use strict';

const _ = require('lodash');
const Bisounours = require('@openagenda/agenda-locations/bisounours');

const getEventCounts = require('./interfaces/getEventCounts');
const getAgendaIdByUid = require('./interfaces/getAgendaIdByUid');

const plugAgendaApp = require('./plugAgendaApp');
const plugEventApp = require('./plugEventApp');
const plugAdminApp = require('./plugAdminApp');
const plugApp = require('./plugApp');

const gaTrack = require('../../../lib/gaTrack.mw');

module.exports = (config, services) => {
  const instance = Bisounours({
    knex: config.knex,
    redis: config.redisClient,
    imagePath: config.aws.imageBucketPath,
    interfaces: {
      getAgendaIdByUid: getAgendaIdByUid(config, services),
      getEventCounts: getEventCounts(config, services)
    }
  });

  return {
    ...instance,
    apps: Object.assign(plugApp.bind(null, config, services, instance), {
      admin: plugAdminApp.bind(null, config, services, instance),
      event: plugEventApp.bind(null, config, services, instance),
      agenda: plugAgendaApp.bind(null, config, services, instance)
    })
  }
}

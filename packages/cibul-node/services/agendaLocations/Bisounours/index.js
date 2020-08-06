'use strict';

const _ = require('lodash');
const Bisounours = require('@openagenda/agenda-locations/bisounours');

const getEventCounts = require('./interfaces/getEventCounts');
const getAgendaIdByUid = require('./interfaces/getAgendaIdByUid');

const plugApp = require('./plugApp');
const plugEventApp = require('./plugEventApp');
const plugAdminApp = require('./plugAdminApp');

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
    apps: {
      admin: plugAdminApp.bind(null, config, services, instance),
      event: plugEventApp.bind(null, config, services, instance),
      public: plugApp.bind(null, config, services, instance)
    }
  }
}

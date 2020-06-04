"use strict";

const { promisify } = require('util');
const cmn = require('../../lib/commons-app');
const defaultStats = require('./defaultStats');

module.exports = {
  init,
  plugApp
};

function init(config) {
  return new Stats({
    redisClient: config.redisClient
  });
}

function plugApp(app, base = '/:agendaSlug/admin/statistics/config') {
  const { sessions, agendas, members, stats } = app.services;

  app.get(
    base,
    sessions.mw.ifUnlogged(cmn.redirectToSignin),
    agendas.mw.load,
    members.mw.authorizeAdminModOrKey(),
    async (req, res, next) => {
      try {
        const result = await stats.get(req.agenda.uid);
        res.send(result);
      } catch (err) {
        next(err);
      }
    }
  );
}

class Stats {
  constructor(config) {
    this.redisClient = new Proxy(config.redisClient, {
      get(target, propKey) {
        if (typeof target[propKey] === 'function') {
          return promisify(target[propKey]).bind(target);
        }
        return target[propKey];
      },
    })
  }

  // async set(data) {
  //   return this.redisClient.set(ANNOUNCEMENT_KEY, JSON.stringify(data));
  // }

  async get(agendaUid) {
    // const stats = await this.redisClient.get(`oa:stats:${agendaUid}`);
    //
    // return stats ? JSON.parse(stats) : stats;

    return defaultStats;
  }

  // async remove() {
  //   return this.redisClient.del(ANNOUNCEMENT_KEY);
  // }
}

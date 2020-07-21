"use strict";

const { promisify } = require('util');
const cmn = require('../../lib/commons-app');
const getAdditionalFieldStats = require('./getAdditionalFieldStats');
const addFieldSchema = require('./addFieldSchema');

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
        const { core } = req.app.services;
        const schema = await core.agendas(req.agenda.uid).settings.schema.getMerged();

        const result = await stats.get(req.agenda.uid, schema);
        res.send(result);
      } catch (err) {
        next(err);
      }
    }
  );

  app.put(
    base,
    sessions.mw.ifUnlogged(cmn.redirectToSignin),
    agendas.mw.load,
    members.mw.authorizeAdminModOrKey(),
    async (req, res, next) => {
      try {
        const result = await stats.set(req.agenda.uid, req.body);
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

  async set(agendaUid, data) {
    return this.redisClient.set(`oa:stats:${agendaUid}`, JSON.stringify(data));
  }

  async get(agendaUid, agendaSchema) {
    const stats = await this.redisClient.get(`oa:stats:${agendaUid}`);

    if (stats) {
      return JSON.parse(stats)
        .map(addFieldSchema(agendaSchema));
    }

    return [
      {
        aggregation: {
          type: 'timings'
        },
        chart: {}
      },
      {
        aggregation: {
          type: 'keywords'
        },
        chart: {}
      }
    ]
      .concat({ separator: true })
      .concat(getAdditionalFieldStats(agendaSchema))
      .map(addFieldSchema(agendaSchema));
  }

  // async remove() {
  //   return this.redisClient.del(ANNOUNCEMENT_KEY);
  // }
}

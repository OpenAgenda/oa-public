"use strict";

const { promisify } = require('util');
const cmn = require('../../lib/commons-app');
const getAdditionalFieldStats = require('./getAdditionalFieldStats');
const addFieldSchema = require('./addFieldSchema');
const pulseSvg = require('./pulseSvg');
const cacheMw = require('../../lib/cache.mw');

module.exports = {
  init,
  plugApp
};

function init(config) {
  return new Stats({
    redisClient: config.redisClient
  });
}

function plugApp(app) {
  const { sessions, agendas, members, stats } = app.services;

  // Public

  app.get(
    '/agendas/:agendaUid/pulse.svg',
    cacheMw('agendas', 'params.agendaUid', 60 * 60 * 24, pulseSvg()),
    pulseSvgHeaders
  );

  // AgendaAdmin

  app.get(
    '/:agendaSlug/admin/statistics/config',
    sessions.mw.ifUnlogged(cmn.redirectToSignin),
    agendas.mw.load,
    agendas.mw.authorizeByIPAddress(),
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
    '/:agendaSlug/admin/statistics/config',
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
        .reduce(addFieldSchema(agendaSchema), []);
    }

    return [
      {
        aggregation: {
          type: 'timings'
        },
        chart: {
          type: 'horizontal',
          intervalSelector: true,
          dataKey: 'timingCount',
          labelKey: 'key',
          tooltip: 'date',
          categoryTick: 'date',
        }
      },
      {
        aggregation: {
          type: 'keywords'
        },
        chart: {
          type: 'vertical',
          dataKey: 'eventCount',
          labelKey: 'key',
          loadMore: true,
        }
      }
    ]
      .concat({ separator: true })
      .concat(getAdditionalFieldStats(agendaSchema))
      .reduce(addFieldSchema(agendaSchema), []);
  }

  // async remove() {
  //   return this.redisClient.del(ANNOUNCEMENT_KEY);
  // }
}

function pulseSvgHeaders(req, res, next) {
  // res.set('Cache-Control', `public, max-age=${delay}`);
  res.set('Expires', res.cacheExpires.toUTCString());
  res.set('Content-Type', 'image/svg+xml');

  next();
}

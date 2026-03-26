import cmn from '../../lib/commons-app.js';
import cacheMw from '../../lib/cache.mw.js';
import getAdditionalFieldStats from './getAdditionalFieldStats.js';
import addFieldSchema from './addFieldSchema.js';
import pulseSvg from './pulseSvg.js';

class Stats {
  constructor({ redis }) {
    this.redis = redis;
  }

  async set(agendaUid, data) {
    return this.redis.set(`oa:stats:${agendaUid}`, JSON.stringify(data));
  }

  async get(agendaUid, agendaSchema) {
    const stats = await this.redis.get(`oa:stats:${agendaUid}`);

    if (stats) {
      return JSON.parse(stats).reduce(addFieldSchema(agendaSchema), []);
    }

    return [
      {
        aggregation: {
          type: 'timings',
        },
        chart: {
          type: 'horizontal',
          intervalSelector: true,
          dataKey: 'timingCount',
          labelKey: 'key',
          tooltip: 'date',
          categoryTick: 'date',
        },
      },
      {
        aggregation: {
          type: 'keywords',
        },
        chart: {
          type: 'vertical',
          dataKey: 'eventCount',
          labelKey: 'key',
          loadMore: true,
        },
      },
    ]
      .concat({ separator: true })
      .concat(getAdditionalFieldStats(agendaSchema))
      .reduce(addFieldSchema(agendaSchema), []);
  }
}

function pulseSvgHeaders(req, res, next) {
  // res.set('Cache-Control', `public, max-age=${delay}`);
  res.set('Expires', res.cacheExpires.toUTCString());
  res.set('Content-Type', 'image/svg+xml');

  next();
}

export function plugApp(app) {
  const { sessions, agendas, members, stats } = app.services;

  // Public

  app.get(
    '/agendas/:agendaUid/pulse.svg',
    cacheMw('agendas', 'params.agendaUid', 60 * 60 * 24, pulseSvg()),
    pulseSvgHeaders,
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
        const schema = await core
          .agendas(req.agenda.uid)
          .settings.schema.getMerged();

        const result = await stats.get(req.agenda.uid, schema);
        res.send(result);
      } catch (err) {
        next(err);
      }
    },
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
    },
  );
}

export function init(config, services) {
  return Object.assign(new Stats({ redis: services.redis }), {
    plugApp,
  });
}

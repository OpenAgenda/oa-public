import _ from 'lodash';
import logs from '@openagenda/logs';
import { requireUser } from '../../lib/authGuards.js';

const log = logs('services/supervisor/task');

function task(services) {
  const { eventSearch } = services;

  return () => {
    setInterval(() => {
      eventSearch.cluster.stats().then(
        (data) => {
          log.info(data);
        },
        (error) => {
          log.error('failed to fetch stats from cluster', { error });
        },
      );
    }, 1000 * 60);
  };
}

export function init(config, services) {
  const { eventSearch } = services;

  return {
    cluster: eventSearch.cluster,
    task: task(services),
  };
}

export function plugApp(app, base = '/elasticsearch') {
  const {
    supervisor: { elasticsearch },
    users,
  } = app.services;

  app.get(
    `${base}/cluster`,
    requireUser,
    users.mw.allowSuperAdmin(),
    async (req, res, next) => {
      try {
        const [stats, nodes, replicas] = await Promise.all([
          elasticsearch.cluster.stats(),
          elasticsearch.cluster.nodes(),
          elasticsearch.cluster.indices().replicas.get(),
        ]);

        res.send({
          stats,
          nodes,
          replicas,
        });
      } catch (e) {
        next(e);
      }
    },
  );

  app.post(
    `${base}/cluster/replicas`,
    requireUser,
    users.mw.allowSuperAdmin(),
    async (req, res, next) => {
      try {
        const { value } = req.body;

        if (!_.isNumber(value) || value < 1 || value > 50) {
          return res.status(400).send('Bad value');
        }

        await elasticsearch.cluster.indices().replicas.set(value);

        res.sendStatus(200);
      } catch (e) {
        next(e);
      }
    },
  );
}

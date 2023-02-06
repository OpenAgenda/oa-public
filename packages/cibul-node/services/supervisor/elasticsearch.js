'use strict';

const _ = require('lodash');

const redirectToSignin = (req, res) => res.redirect(
  302,
  `/signin?redirect=${Buffer.from(req.originalUrl, 'utf-8').toString('base64')}`,
);

function init(config, services) {
  const { eventSearch } = services;

  return {
    cluster: eventSearch.cluster,
  };
}

function plugApp(app, base = '/elasticsearch') {
  const { sessions, supervisor: { elasticsearch } } = app.services;

  app.get(
    `${base}/cluster`,
    sessions.mw.ifUnlogged(redirectToSignin),
    sessions.mw.requireSuperAdmin,
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
    sessions.mw.ifUnlogged(redirectToSignin),
    sessions.mw.requireSuperAdmin,
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

module.exports = {
  init,
  plugApp,
};

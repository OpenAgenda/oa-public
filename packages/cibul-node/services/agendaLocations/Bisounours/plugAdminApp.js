'use strict';

const _ = require('lodash');
const expressUtils = require('@openagenda/utils/express');

module.exports = (config, services, instance, app, base) => {
  const {
    members,
  } = services;

  app.get(`${base}.json`,
    expressUtils.https,
    members.mw.authorizeAdminModOrKey({ agendaUidPath: 'params.agendaUid' }),
    (req, res, next) => {
      instance(req.params.agendaUid).list(
        req.query,
        _.pick(req.query, ['offset', 'limit']),
        { total: true, eventCounts: true, detailed: true }
      ).then(({ items, total }) => res.json({ items, total }), next);
    }
  );

  app.get(`${base}/unverified`,
    expressUtils.https,
    members.mw.authorizeAdminModOrKey({ agendaUidPath: 'params.agendaUid' }),
    (req, res, next) => {
      instance(req.params.agendaUid)
        .list({ state: 0 }, { limit: 0 }, { total: true })
        .then(({ total }) => res.json({ count: total }), next);
    }
  );

  app.get(base, (err, req, res, next) => {
    res.status(500).json();
    log('error', err);
  });
};

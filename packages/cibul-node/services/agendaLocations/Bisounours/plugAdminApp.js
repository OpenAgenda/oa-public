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
    },
    (err, req, res) => {
      res.status(500).json();
      log('error', err);
    }
  );
};

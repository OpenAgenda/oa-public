'use strict';

const log = require('@openagenda/logs')(
  'services/eventSearch/agendaRestrictedEventSearchRoutes'
);
const { Router } = require('express');
const expressUtils = require('@openagenda/utils').express;

module.exports = (services) => {
  const { core, members } = services;

  return Router({ mergeParams: true }).get(
    '',
    expressUtils.https,
    members.mw.authorizeAdminModOrKey({ agendaUidPath: 'params.agendaUid' }),
    (req, res, next) => {
      const access = req.member.role === 2 ? 'administrator' : 'moderator';

      core
        .agendas(req.params.agendaUid)
        .events.search(req.query, req.query, {
          ...req.query,
          access,
        })
        .then(result => {
          req.result = result;
          next();
        }, next);
    },
    (req, res, next) => {
      res.json(req.result);
    },
    (err, req, res, next) => {
      if (err.name === 'NotFoundError') {
        res.status(err.statusCode).send(null);
      } else if (err.name === 'BadRequest') {
        res.status(err.statusCode).json({
          error: err.detail,
          requested: req.query.aggregations
        });
      } else {
        res.status(500).send();
        log('error', err);
      }
    }
  );
};

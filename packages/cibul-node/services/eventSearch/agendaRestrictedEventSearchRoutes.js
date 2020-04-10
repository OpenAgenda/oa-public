'use strict';

const log = require('@openagenda/logs')(
  'services/eventSearch/agendaRestrictedEventSearchRoutes'
);
const { Router } = require('express');

module.exports = (services) => {
  const { core, members } = services;

  return Router({ mergeParams: true }).get(
    '',
    members.mw.authorizeAdminModOrKey({ agendaUidPath: 'params.agendaUid' }),
    (req, res, next) => {
      core
        .agendas(req.params.agendaUid)
        .events.search(req.query, req.query, {
        ...req.query,
        access: 'public',
      })
        .then((result) => {
          req.result = result;
          next();
        }, next);
    },
    (req, res, next) => {
      res.json(req.result);
    },
    (err, req, res, next) => {
      if (err.name !== 'NotFoundError') {
        log('error', err);
        res.status(500).send();
      } else {
        res.status(404).send(null);
      }
    }
  );
};

'use strict';

const _ = require('lodash');
const csv = require('fast-csv');
const expressUtils = require('@openagenda/utils/express');
const log = require('@openagenda/logs')('locations/plugAdminApp');
const transformLocationForFlatExport = require('./lib/transformLocationForFlatExport');

module.exports = (config, services, instance, app, base) => {
  const {
    members,
    agendas
  } = services;

  app.use(`${base}*`,
    expressUtils.https,
    agendas.mw.loadBy({
      path: 'params.agendaUid',
      field: 'uid'
    }),
    members.mw.authorizeAdminModOrKey({ agendaUidPath: 'params.agendaUid' }),
    (req, res, next) => {
      req.locations = instance(req.params.agendaUid);
      next();
    }
  );

  app.get(`${base}.json`,
    (req, res, next) => {
      req.locations.list(
        req.query,
        _.pick(req.query, ['offset', 'limit']),
        { total: true, eventCounts: true, detailed: true }
      ).then(({ items, total }) => res.json({ items, total }), next);
    }
  );

  app.get(`${base}.csv`,
    (req, res, next) => {
      req.locations
        .stream(req.query, {
          eventCounts: true,
          detailed: true,
          includeFields: ['uid', 'name', 'address', 'city', 'department', 'postalCode', 'region', 'countryCode', 'latitude', 'longitude', 'state', 'extId'],
          transform: transformLocationForFlatExport({ lang: req.lang })
        })
        .pipe(csv.format({
          headers: true,
          delimiter: ';',
          quote: '"',
          escape: '"'
        })).pipe(res);

      res.writeHead(200, {
        'Content-Type': 'text/csv',
        'content-disposition': `attachment; filename="${req.agenda.slug}.locations.csv"`
      });
    });


  app.get(`${base}/unverified`, (req, res, next) => {
    req.locations.list({ state: 0 }, { limit: 0 }, { total: true })
      .then(({ total }) => res.json({ count: total }), next);
  });

  app.get(base, (err, req, res, next) => {
    res.status(500).json();
    log('error', err);
  });
};

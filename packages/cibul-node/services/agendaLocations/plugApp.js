'use strict';

const _ = require('lodash');

const expressUtils = require('@openagenda/utils/express');
const gaTrack = require('../../lib/gaTrack.mw');
const log = require('@openagenda/logs')('services/locations/plugApp');

module.exports = (config, services, instance, app, base) => {
  const { geocoder } = config;

  app.use(base, expressUtils.https);

  app.get(`${base}/:locationUid.json`,
    (req, res, next) => {
      instance.get(req.params.locationUid, {
        includeImagePath: true,
        includeOriginAgendaUid: true
      }).then(location => res.json(location), next);
    },
    (err, req, res) => {
      res.status(500).json();
      log('error', err);
    }
  );

  app.get(`${base}/geocode`, (req, res, next) => geocoder(req.query.address, {
    countryCode: req.query.countryCode,
    language: req.lang || 'fr'
  }).then(results => res.send({ results })));

  app.get(`${base}/geocode/reverse`, (req, res, next) => geocoder
    .reverse(req.query.latitude, req.query.longitude, {
      language: req.lang || 'fr'
    }).then(results => res.send({ results }))
  );

  app.get(`${base}/insee`, (req, res, next) => instance.utils.getINSEECode(
    _.pick(req.query, ['city', 'department', 'latitude', 'longitude'])
  ).then(code => res.json({ code }), next));

  app.use(base, (err, req, res, next) => {
    res.status(500).json();
    log('error',  err?.meta?.body?.error ?? err);
  });
}

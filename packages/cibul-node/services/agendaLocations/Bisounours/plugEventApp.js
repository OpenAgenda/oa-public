'use strict';

const _ = require('lodash');
const expressUtils = require('@openagenda/utils/express');
const OpenCage = require('@openagenda/geocoder/Opencage');

module.exports = (config, services, instance, app, base) => {
  const geocoder = OpenCage(config.opencage);

  app.use(base, expressUtils.https);

  app.get(`${base}`, (req, res, next) => {
    instance(req.params.agendaUid).list(req.query, _.pick(req.query, ['offset', 'limit']), {
      total: true
    }).then(({ items, total }) => res.json({ items, total }), next);
  });

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

  app.use((err, req, res, next) => {
    res.status(500).json();
    log('error', err);
  });

}

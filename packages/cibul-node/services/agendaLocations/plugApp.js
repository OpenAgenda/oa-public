'use strict';

const _ = require('lodash');
const log = require('@openagenda/logs')('services/locations/plugApp');

module.exports = (config, services, instance, app, base) => {
  const { geocoder } = config;

  app.get(
    `${base}/:locationUid.json`,
    (req, res, next) => {
      instance.get(req.params.locationUid, {
        includeImagePath: true,
        includeFields: [
          'uid', 'setUid', 'slug', 'name', 'address',
          'countryCode', 'adminLevel1', 'adminLevel2',
          'adminLevel3', 'adminLevel4', 'adminLevel5',
          'district', 'postalCode', 'insee', 'latitude', 'longitude',
          'region', 'department', 'city', 'timezone',
          'updatedAt', 'createdAt', 'image', 'description', 'tags',
          'website', 'email', 'phone', 'links', 'access',
          'state', 'imageCredits', 'extId',
          'duplicateCandidates', 'disqualifiedDuplicates',
          'mergedIn', 'agendaUid',
        ],
      }).then(location => res.json(location), next);
    },
    (err, req, res) => {
      res.status(500).json();
      log('error', err);
    },
  );

  app.get(`${base}/geocode`, (req, res, _next) => geocoder(req.query.address, {
    countryCode: req.query.countryCode,
    language: req.lang || 'fr',
  }).then(results => res.send({ results })));

  app.get(`${base}/geocode/reverse`, (req, res, _next) => geocoder
    .reverse(req.query.latitude, req.query.longitude, {
      language: req.lang || 'fr',
    }).then(results => res.send({ results })));

  app.get(`${base}/insee`, (req, res, next) => instance.utils.getINSEECode(
    _.pick(req.query, ['city', 'department', 'latitude', 'longitude']),
  ).then(code => res.json({ code }), next));

  app.use(base, (err, req, res, _next) => {
    res.status(500).json();
    log('error', err?.meta?.body?.error ?? err);
  });
};

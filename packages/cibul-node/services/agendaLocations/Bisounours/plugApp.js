'use strict';

const _ = require('lodash');
const expressUtils = require('@openagenda/utils/express');
const gaTrack = require('../../../lib/gaTrack.mw');
const log = require('@openagenda/logs')('services/locations/plugApp');

module.exports = (config, services, instance, app, base) => {
  app.use(base, expressUtils.https);

  app.get(`${base}/:locationUid.json`,
    expressUtils.https,
    (req, res, next) => {
      instance.get(
        req.params.locationUid
      ).then(location => res.json(location), next);
    },
    (err, req, res) => {
      res.status(500).json();
      log('error', err);
    }
  );

  app.use((err, req, res, next) => {
    res.status(500).json();
    log('error', err);
  });
}

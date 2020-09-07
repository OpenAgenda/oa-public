'use strict';

const _ = require('lodash');
const expressUtils = require('@openagenda/utils/express');
const log = require('@openagenda/logs')('services/locations/plugEventApp');

const {
  loadLocation,
  setImageOnExistingLocation,
  setImageOnNewLocation
} = require('./lib/middleware');

module.exports = (config, services, instance, app, base) => {
  const {
    members,
    agendas
  } = services;

  app.use(base,
    expressUtils.https,
    agendas.mw.loadBy({
      path: 'params.agendaUid',
      field: 'uid'
    }),
    members.mw.loadAndAuthorize('contributor'),
    (req, res, next) => {
      req.locations = instance(req.params.agendaUid);
      next();
    }
  );

  app.get(`${base}`, (req, res, next) => {
    instance(req.params.agendaUid).list(req.query, _.pick(req.query, ['offset', 'limit']), {
      total: true
    }).then(({ items, total }) => res.json({ items, total }), next);
  });

  app.post(`${base}`,
    (req, res, next) => {
      req.locations.create({
        ...req.body,
        state: 0
      }, {
        includeImagePath: true
      }).then(location => {
        res.json({
          location,
          success: true
        });
      }, err => {
        if (err.name === 'ValidationError') {
          res.status(400).json({
            errors: err.detail,
            success: false
          });
        } else {
          next(err);
        }
      });
    }
  );

  app.post(`${base}/images`,
    instance.utils.images.multer,
    setImageOnNewLocation(instance)
  );

  app.post(`${base}/images/remove`, (req, res, next) => {
    res.send('ok');
  });

  app.use((err, req, res, next) => {
    res.status(500).json();
    log('error', err);
  });

}

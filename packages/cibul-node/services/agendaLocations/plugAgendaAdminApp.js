'use strict';

const _ = require('lodash');
const csv = require('fast-csv');
const XlsxStream = require('xlsx-writestream');
const expressUtils = require('@openagenda/utils/express');
const log = require('@openagenda/logs')('locations/plugAgendaAdminApp');
const multer = require('multer');
const transformLocationForFlatExport = require('./lib/transformLocationForFlatExport');

const layout = require( '../lib/layouts' ).load(
  'agendaAdmin', { selectedTab: 'locations' }
);

const {
  loadLocation,
  getLocationSettings,
  parseDataWithImageStream
} = require('./lib/middleware');

module.exports = (config, services, instance, app, base) => {
  const {
    members,
    agendas
  } = services;

  app.use(`${base}*`,
    expressUtils.https,
    agendas.mw.loadBy({
      path: 'params.agendaSlug',
      field: 'slug'
    }),
    members.mw.authorizeAdminModOrKey({ agendaUidPath: 'agenda.uid' }),
    (req, res, next) => {
      req.locations = instance(req.agenda.uid);
      next();
    }
 );

  app.get(base,
    getLocationSettings,
    (req, res, next) => {

      res.send(layout('<div class="js_canvas"></div>', {
        role: req.member.role,
        lang: req.lang,
        agenda: req.agenda,
        bodyAttributes: [{
          name: 'data-options',
          value: JSON.stringify({
            detailedInfo: _.get(req, 'locationLegacySettings.admin.detailed', true),
            settings: req.locationLegacySettings,
            lang: req.lang,
            enableGeocode: true,
            agenda: {
              slug: req.agenda.slug,
              title: req.agenda.title,
              uid: req.agenda.uid
            },
            mapboxKey: config.mapboxAccessToken,
            res: {
              csv: `/${req.agenda.slug}/admin/locations.csv`,
              xlsx: `/${req.agenda.slug}/admin/locations.xlsx`,
              index: `/${req.agenda.slug}/admin/locations.json`,
              geocode: `/locations/geocode`,
              insee: `/locations/insee`,
              reverseGeocode: `/locations/geocode/reverse`,
              seeEvents: `/${process.NODE_ENV === 'development' ? 'frontend_dev.php/' : ''}${req.agenda.slug}/admin?locationUid=:locationUid`,
              create: `/${req.agenda.slug}/admin/locations`,
              update: `/${req.agenda.slug}/admin/locations/:locationUid`,
              get: `/${req.agenda.slug}/admin/locations/:locationUid.json`,
              remove: `/${req.agenda.slug}/admin/locations/:locationUid`,
              merge: `/${req.agenda.slug}/admin/locations/merge`
            }
          })
        }],
        scripts: {
          bottom: [ { src: '/js/locationsIndex.js' } ]
        }
      }));
    }
  );

  app.get(`${base}.json`, (req, res, next) => {
    req.locations.list(
      req.query,
      _.pick(req.query, ['offset', 'limit']),
      { total: true, eventCounts: true, detailed: true, includeImagePath: true }
   ).then(({ items, total }) => res.json({ items, total }), next);
  });

  app.get([`${base}.csv`, `${base}.xlsx`], (req, res, next) => {
    req.locations.list(req.query, {}, {
      stream: true,
      eventCounts: true,
      detailed: true,
      includeImagePath: true,
      includeFields: ['uid', 'name', 'address', 'city', 'department', 'postalCode', 'region', 'countryCode', 'latitude', 'longitude', 'state', 'extId']
    }).then(stream => {
      req.stream = stream.pipe(transformLocationForFlatExport({ lang: req.lang }));
      next();
    }, next);
  });

  app.get(`${base}.csv`, (req, res, next) => {
    req.stream.pipe(csv.format({
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

  app.get(`${base}.xlsx`, (req, res, next) => {
    const xlsx = new XlsxStream();
    xlsx.getReadStream().pipe(res);
    req.stream.on('data', data => xlsx.addRow(data));
    req.stream.on('end', () => xlsx.finalize());

    res.writeHead(200, {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'content-disposition': `attachment; filename="${req.agenda.slug}.locations.xlsx"`
    });
  });

  app.get(`${base}/:locationUid.json`,
    expressUtils.https,
    (req, res, next) => {
      instance.get(req.params.locationUid, {
        includeImagePath: true
      }).then(location => res.json(location), next);
    },
    (err, req, res) => {
      res.status(500).json();
      log('error', err);
    }
 );

  app.post(`${base}`,
    multer({ dest: config.tmpFolderPath }).single('image'),
    parseDataWithImageStream,
    (req, res, next) => {
      req.locations.create({ ...req.data, state: 1 }, {
        includeImagePath: true
      }).then(location => {
        res.json({
          location,
          success: true
        });
      }, next);
    });

  app.post(`${base}/merge`, (req, res, next) => {
    const fieldsToOmit = Object.keys(req.body || {})
      .filter(field => req.body[field] === null)
      .concat(['agendaId', 'uid']);

    req.locations.merge(
      req.query,
      _.omit(req.body || {}, fieldsToOmit)
   ).then(location => res.json({
      location,
      success: true
    }), next);
  });

  app.get(`${base}/unverified`, (req, res, next) => {
    req.locations.list({ state: 0 }, { limit: 0 }, { total: true })
      .then(({ total }) => res.json({ count: total }), next);
  });

  app.get(`${base}/terms`, (req, res, next) => {
    req.locations.terms(req.query.field.split(','), {}, { filterNulls: true })
      .then(terms => res.json({ terms }));
  });

  app.post(`${base}/:locationUid`,
    multer({ dest: config.tmpFolderPath }).single('image'),
    parseDataWithImageStream,
    (req, res, next) => {
      req.locations.update(req.params.locationUid, req.data, {
        includeImagePath: true
      }).then(location => {
        res.json({
          location,
          success: true
        });
      }, next);
    }
 );

  app.delete(`${base}/:locationUid`,
    (req, res, next) => {
      req.locations.remove(req.params.locationUid, {
        includeImagePath: true
      }).then(location => {
        res.json({
          location,
          success: true
        });
      }, next);
    }
 );

  app.use(base, (err, req, res, next) => {
    if (err.name === 'ValidationError') {
      res.status(400).json({
        errors: err.detail,
        success: false
      });
    } else {
      res.status(500).json();
      log('error', err);
    }
  });
};

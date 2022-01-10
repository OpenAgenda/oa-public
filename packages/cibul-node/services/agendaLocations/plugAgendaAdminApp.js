'use strict';

const _ = require('lodash');
const csv = require('fast-csv');
const ExcelJS = require('exceljs');
const expressUtils = require('@openagenda/utils/express');
const trackingScripts = require('../../lib/trackingScripts');
const loadLocationEndpoints = require('./lib/loadLocationEndpoints');
const log = require('@openagenda/logs')('locations/plugAgendaAdminApp');
const transformLocationForFlatExport = require('./lib/transformLocationForFlatExport');

const layout = require('../lib/layouts').load(
  'agendaAdmin', { selectedTab: 'locations' }
);

const {
  getLocationSet,
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
    agendas.mw.authorizeByIPAddress(),
    members.mw.authorizeAdminModOrKey({ agendaUidPath: 'agenda.uid' }),
    loadLocationEndpoints(instance));

  app.get(base,
    getLocationSet(instance),
    (req, res, _next) => {
      const layoutData = {
        role: req.member.role,
        lang: req.lang,
        agenda: req.agenda,
        bodyAttributes: [
          {
            name: 'data-options',
            value: JSON.stringify({
              detailedInfo: _.get(req, 'locationLegacySettings.admin.detailed', true),
              settings: req.settings,
              lang: req.lang,
              enableGeocode: true,
              agenda: {
                slug: req.agenda.slug,
                title: req.agenda.title,
                uid: req.agenda.uid
              },
              tiles: config.tiles,
              staticTiles: config.staticTiles,
              set: req.locationSet,
              res: {
                csv: `/${req.agenda.slug}/admin/locations.csv`,
                xlsx: `/${req.agenda.slug}/admin/locations.xlsx`,
                index: `/${req.agenda.slug}/admin/locations.json`,
                geocode: '/locations/geocode',
                insee: '/locations/insee',
                reverseGeocode: '/locations/geocode/reverse',
                seeEvents: `/${req.agenda.slug}/admin/events?locationUid=:locationUid&q.locationUid=:locationUid`,
                create: `/${req.agenda.slug}/admin/locations`,
                update: `/${req.agenda.slug}/admin/locations/:locationUid`,
                get: `/${req.agenda.slug}/admin/locations/:locationUid.json`,
                remove: `/${req.agenda.slug}/admin/locations/:locationUid`,
                merge: `/${req.agenda.slug}/admin/locations/merge`,
                agendaSearch: '/agendas',
                disqualifyDuplicates: `/${req.agenda.slug}/admin/locations/disqualify`,
              }
            })
          }
        ],
        scripts: {
          bottom: [{
            src: '/js/locationsIndex.js'
          }].concat(
            trackingScripts({
              matomoCloudCode: config.matomoCloudCode,
              googleAnalyticsID: config.googleAnalyticsId,
              agenda: req.agenda
            }).map(body => ({ body }))
          )
        }
      };

      layoutData.translateMode = Boolean(req.cookies.translateMode);
      layoutData.isTranslator = req.user?.uid && config.translators.includes(req.user.uid);

      if (req.cookies.translateMode) {
        layoutData.scripts.top = [
          { body: 'window._jipt = [[\'project\', \'openagenda\']];' },
          { src: '//cdn.crowdin.com/jipt/jipt.js' }
        ];
      }

      res.send(layout('<div class="js_canvas"></div>', layoutData));
    });

  app.get(`${base}.json`, (req, res, next) => {
    req.locations.list(
      req.query,
      _.pick(req.query, ['offset', 'limit']),
      {
        total: true, eventCounts: true, detailed: true, includeImagePath: true
      }
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
    const workbook = new ExcelJS.stream.xlsx.WorkbookWriter();
    const worksheet = workbook.addWorksheet('Locations');
    const locations = [];
    req.stream.on('data', data => {
      locations.push(data);
    });

    req.stream.on('end', () => {
      worksheet.columns = [...new Set(locations.reduce((carry, data) => Object.keys(data).map(key => ({ header: key, key, width: 10 }))))];

      for (const location of locations) {
        worksheet.addRow(location).commit();
      }

      workbook.commit();
    });

    workbook.stream.pipe(res);

    res.writeHead(200, {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'content-disposition': `attachment; filename="${req.agenda.slug}.locations.xlsx"`
    });
  });

  app.get(`${base}/:locationUid.json`,
    expressUtils.https,
    (req, res, next) => {
      instance.get(req.params.locationUid, {
        includeImagePath: true,
        eventCounts: true,
        includeLinkedAgendas: true,
      }).then(location => res.json(location), next);
    });

  app.get(`${base}/unverified`, (req, res, next) => {
    req.locations.list({ state: 0 }, { limit: 0 }, { total: true })
      .then(({ total }) => res.json({ count: total }), next);
  });

  app.get(`${base}/terms`, (req, res, next) => {
    req.locations.terms(req.query.field.split(','), {}, { filterNulls: true })
      .then(terms => res.json({ terms }));
  });

  app.post(
    [
      `${base}`,
      `${base}/merge`,
      `${base}/:locationUid`
    ],
    instance.imageTransformAndUpload.middleware([
      {
        name: 'image',
        unique: true
      }
    ])
  );

  app.post(`${base}`, (req, res, next) => {
    req.locations.create({ ...req.body, state: 1 }, {
      includeImagePath: true,
      agendaUid: req.agenda?.uid
    }).then(location => {
      res.json({
        location,
        success: true
      });
    }, next);
  });

  app.post(`${base}/disqualify`, (req, res, next) => {
    req.locations
      .duplicates.disqualifyCandidate(
        req.body.uids
      )
      .then(location => {
        res.json({
          location,
          success: true,
        });
      }, next);
  });

  app.post(`${base}/merge`, (req, res, next) => {
    req.locations.merge(
      req.body.mergeIn,
      { uids: req.body.merged },
      null,
      { agendaUid: req.agenda?.uid }
    ).then(location => res.json({
      location,
      success: true
    }), next);
  });

  app.post(`${base}/:locationUid`, (req, res, next) => {
    req.locations.update(req.params.locationUid, req.body, {
      includeImagePath: true,
      eventCounts: true,
      agendaUid: req.agenda?.uid
    }).then(location => {
      res.json({
        location,
        success: true
      });
    }, next);
  });

  app.delete(`${base}/:locationUid`, (req, res, next) => {
    req.locations.remove(req.params.locationUid, {
      includeImagePath: true,
      agendaUid: req.agenda?.uid,
      removeEvents: !!req.query.removeEvents
    }).then(location => {
      res.json({
        location,
        success: true
      });
    }, next);
  });

  app.use(base, (err, req, res, next) => {
    if (err.name === 'BadRequest') {
      res.status(400).json({
        errors: err.info,
        success: false
      });
    } else {
      next(err);
    }
  });
};

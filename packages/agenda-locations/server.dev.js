'use strict';

const fs = require('fs');
const http = require('http');
const _ = require('lodash');
const cors = require('cors');
const errorHandler = require('errorhandler');
const knex = require('knex');
const redis = require('redis');
const express = require('express');
const morgan = require('morgan');

const log = (...args) => {
  console.log.apply(null, args);
};

const Files = require('@openagenda/files');
const multer = require('multer');

const fixtures = require('./test/fixtures');
const Service = require('.');

(async () => {
  const f = fixtures({
    host: process.env.OA_MYSQL_DEV_HOST,
    user: process.env.OA_MYSQL_DEV_USER,
    password: process.env.OA_MYSQL_DEV_PASSWORD,
    database: 'location_test',
    ssl: true,
  });

  await f.load();

  const app = express();

  const server = http.createServer(app);

  const svc = Service({
    knex: f.client,
    redis: redis.createClient(),
    Files: Files({
      s3: {
        accessKeyId: process.env.AWS_KEY,
        secretAccessKey: process.env.AWS_SECRET,
        region: process.env.AWS_REGION,
        defaultBucket: process.env.AWS_BUCKET,
      },
      defaultProvider: 's3',
    }),
    imagePath: '//oadev.s3.amazonaws.com/',
    interfaces: {
      getAgendaDetailsByUid: async uid => ({
        id: {
          25221: 7196947,
        }[uid],
      }),
      getEventCounts: async (_locationUids, { _agendaUid }) => [
        {
          uid: 60763721,
          eventCount: 12,
          agendaEventCount: 1,
        },
        {
          uid: 51665985,
          eventCount: 1,
          agendaEventCount: 1,
        },
      ],
      getLinkedAgendas: async () => [
        {
          uid: 79882300,
          title: 'Morbihan test'
        },
        {
          uid: 79882301,
          title: 'Morbihan test2'
        },
        {
          uid: 79882302,
          title: 'Morbihan test3'
        },
        {
          uid: 79882303,
          title: 'Morbihan test4'
        }
      ]
    },
  });

  // load fixtures.

  app.server = server;

  /*
   * Run `yarn knex migrate:latest` and `yarn knex seed:run` before to run the dev server
   * */

  // if (['development', 'test'].includes(process.env.NODE_ENV)) {
  app.use(morgan('dev'));
  // }

  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.use((req, res, next) => {
    req.agendaId = 123;
    req.userUid = 456;
    next();
  });

  app.get('/locations/', (req, res, _next) => svc(7196947)
    .list(req.query, _.pick(req.query, ['offset', 'limit']), {
      total: true,
      eventCounts: true,
      detailed: true,
      includeImagePath: true,
    })
    .then(result => res.json({
      success: true,
      ...result,
    })));

  app.get('/locations/unverified', (req, res, next) => svc(7196947).list({ state: 0 }, { limit: 0 }, { total: true }).then(
    ({ total }) => res.json({ count: total }),
    next
  ));

  app.get('/locations/geocode', (req, res, _next) => res.json({
    results: [
      {
        address: 'Rue Alice, 92400 Courbevoie, France',
        adminLevel1: 'Île-de-France',
        adminLevel2: 'Hauts-de-Seine',
        adminLevel4: 'Courbevoie',
        adminLevel6: 'Quartier de Bécon',
        postalCode: '92400',
        timezone: 'Europe/Paris',
        latitude: 48.9025825,
        longitude: 2.279693,
        country: 'France',
        countryCode: 'fr',
      },
    ],
  }));

  app.get('/locations/unverified', (req, res, next) => svc(7196947).list({ state: 0 }, { limit: 0 }, { total: true }).then(
    ({ total }) => res.json({ count: total }),
    next
  ));

  app.get('/locations/insee', (req, res, next) => svc.utils
    .getINSEECode(
      _.pick(req.query, ['city', 'department', 'latitude', 'longitude'])
    )
    .then(code => res.json({ code }), next));

  app.get('/locations/geocode/reverse', (req, res, _next) => res.json({
    results: [
      {
        address:
            'École Maternelle Alphonse Daudet, Rue Fallet, 92400 Courbevoie, France',
        adminLevel1: 'Île-de-France',
        adminLevel2: 'Hauts-de-Seine',
        adminLevel4: 'Courbevoie',
        adminLevel6: 'Quartier de Bécon',
        postalCode: '92400',
        timezone: 'Europe/Paris',
        latitude: 48.9019071,
        longitude: 2.2789371,
        country: 'France',
        countryCode: 'fr',
      },
    ],
  }));

  app.get('/locations/terms', (req, res, _next) => {
    svc(7196947)
      .terms(req.query.field.split(','), {}, { filterNulls: true })
      .then(terms => res.json({ terms }));
  });

  app.get('/locations/:locationUid', (req, res, next) => {
    log('get for %s detailed %s', req.params.locationUid, req.query.detailed);
    svc(7196947)
      .get(req.params.locationUid, {
        includeImagePath: true,
        eventCounts: req.query.detailed === '1',
        includeLinkedAgendas: true,
      })
      .then(location => res.json(location), next);
  });

  app.post(
    ['/locations/', '/locations/:locationUid'],
    multer({ dest: '/tmp/' }).single('image'),
    (req, res, next) => {
      req.data = req.body.data ? JSON.parse(req.body.data) : req.body;
      if (req.file) {
        req.data.image = fs.createReadStream(req.file.path);
        req.data.image.on('end', () => {
          fs.unlink(req.file.path, () => {});
        });
      }
      next();
    }
  );

  app.post('/locations/merge', (req, res, next) => {
    log('merge route called');
    log('req.body:', req.body);

    // simulating error for merge Modal
    if (req.body.mergeIn === 60763722) {
      log('should resp error');
      res.status(400).json({
        errors: 'details',
        success: false,
      });
    } else {
      svc(7196947)
        .merge(
          req.body.mergeIn,
          req.body.merged
        )
        .then(
          location => res.json({
            location,
            success: true,
          }),
          next
        );
    }
  });

  app.post('/locations/', (req, res, next) => {
    svc(7196947)
      .create(
        { ...req.data, state: 1 },
        {
          includeImagePath: true,
        }
      )
      .then(location => {
        res.json({
          location,
          success: true,
        });
      }, next);
  });

  app.post('/locations/disqualify', (req, res, next) => {
    svc(7196947)
      .duplicates.disqualifyCandidate(
        req.data.uids
      )
      .then(location => {
        res.json({
          location,
          success: true,
        });
      }, next);
  });

  app.post('/locations/:locationUid', (req, res, next) => {
    svc(7196947)
      .update(req.params.locationUid, req.data, {
        includeImagePath: true,
        eventCounts: true,
      })
      .then(location => {
        res.json({
          location,
          success: true,
        });
      }, next);
  });

  app.delete('/locations/:locationUid', (req, res, next) => {
    log('delete with removeEvents:', !!req.query.removeEvents);
    svc(7196947)
      .remove(req.params.locationUid, {
        includeImagePath: true,
        removeEvents: !!req.query.removeEvents
      })
      .then(location => {
        res.json({
          location,
          success: true,
        });
      }, next);
  });

  app.use('', (err, req, res, _next) => {
    if (err.name === 'ValidationError') {
      res.status(400).json({
        errors: err.detail,
        success: false,
      });
    } else {
      res.status(500).json();
      log('error', err);
    }
  });

  // if (process.env.NODE_ENV !== 'test') {
  server.listen(process.env.PORT || 3000, () => {
    // eslint-disable-next-line no-console
    console.log(
      `\nDev server started on => http://localhost:${server.address().port}/`
    );
  });
  // }
})();

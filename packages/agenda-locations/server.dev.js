'use strict';

const _ = require('lodash');
const fs = require('fs');
const cors = require('cors');
const errorHandler = require('errorhandler');
const http = require('http');
const knex = require('knex');
const express = require('express');
const morgan = require('morgan');
const log = require('@openagenda/logs')('server.dev');

const Files = require('@openagenda/files/v3');
const multer = require('multer');

const fixtures = require('./test/fixtures');

(async () => {

  const f = fixtures({
    host: process.env.OA_MYSQL_DEV_HOST,
    user: process.env.OA_MYSQL_DEV_USER,
    password: process.env.OA_MYSQL_DEV_PASSWORD,
    database: 'location_test',
    ssl: true
  });

  await f.load();

  const app = express();

  const server = http.createServer(app);

  const svc = require('.')({
    knex: f.client,
    Files: Files({
      s3: {
        accessKeyId: process.env.AWS_DEV_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_DEV_SECRET_ACCESS_KEY,
        region: process.env.AWS_DEV_REGION,
        defaultBucket: process.env.AWS_DEV_BUCKET
      },
      defaultProvider: 's3'
    }),
    imagePath: '//oadev.s3.amazonaws.com/',
    interfaces: {
      getAgendaIdByUid: async id => ({
        25221: 7196947
      })[id],
      getEventCounts: async (locationUids, { agendaUid }) => [{
        uid: 60763721,
        eventCount: 12,
        agendaEventCount: 8
      }, {
        uid: 51665985,
        eventCount: 9,
        agendaEventCount: 2
      }]
    }
  });

  // load fixtures.

  app.server = server;

  /*
   * Run `yarn knex migrate:latest` and `yarn knex seed:run` before to run the dev server
   * */

  //if (['development', 'test'].includes(process.env.NODE_ENV)) {
    app.use(morgan('dev'));
  //}

  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.use((req, res, next) => {
    req.log = console.log;
    req.agendaId = 123;
    req.userUid = 456;
    next();
  });

  app.get('/', (req, res, next) => svc(7196947)
    .list(req.query, _.pick(req.query, ['offset', 'limit']), {
      total: true,
      eventCounts: true,
      detailed: true,
      includeImagePath: true
    }).then(result => res.json({
      success: true,
      ...result
    }))
  );

  //app.get('/toverify', mw.getUnverifiedCount);
  app.get('/geocode', (req, res, next) => res.json({
    "results": [{
      "address": "Rue Alice, 92400 Courbevoie, France",
      "district": "Quartier de Bécon",
      "city": "Courbevoie",
      "postalCode": "92400",
      "department": "Hauts-de-Seine",
      "region": "Île-de-France",
      "timezone": "Europe/Paris",
      "latitude": 48.9025825,
      "longitude": 2.279693,
      "country": "France",
      "countryCode": "fr"
    }]
  }));

  app.get('/insee', (req, res, next) => svc.utils.getINSEECode(
    _.pick(req.query, ['city', 'department', 'latitude', 'longitude'])
  ).then(code => res.json({ code }), next));

  app.get('/geocode/reverse', (req, res, next) => res.json({
    "results": [
      {
        "address": "École Maternelle Alphonse Daudet, Rue Fallet, 92400 Courbevoie, France",
        "district": "Quartier de Bécon",
        "city": "Courbevoie",
        "postalCode": "92400",
        "department": "Hauts-de-Seine",
        "region": "Île-de-France",
        "timezone": "Europe/Paris",
        "latitude": 48.9019071,
        "longitude": 2.2789371,
        "country": "France",
        "countryCode": "fr"
      }
    ]
  }));

  app.get('/terms', (req, res, next) => {
    svc(7196947).terms(req.query.field.split(','), {}, { filterNulls: true })
      .then(terms => res.json({ terms }));
  });

  app.get('/:locationUid', (req, res, next) => {
    svc(7196947).get(req.params.locationUid, {
      includeImagePath: true,
    }).then(location => res.json(location), next);
  });

  app.post(['/', '/:locationUid'],
    multer({ dest: '/tmp/' }).single('image'),
    (req, res, next) => {
      req.data = JSON.parse(req.body.data);
      if (req.file) {
        req.data.image = fs.createReadStream(req.file.path);
        req.data.image.on('end', () => {
          fs.unlink(req.file.path, () => {});
        });
      }
      next();
    }
  );

  app.post('/', (req, res, next) => {
    svc(7196947).create({ ...req.data, state: 1 }, {
      includeImagePath: true
    }).then(location => {
      res.json({
        location,
        success: true
      });
    }, next);
  });

  app.delete('/:locationUid', (req, res, next) => {
    svc(7196947).remove(req.params.locationUid, {
      includeImagePath: true
    }).then(location => {
      res.json({
        location,
        success: true
      });
    }, next);
  });

  app.post('/merge', (req, res, next) => {
    const fieldsToOmit = Object.keys(req.body || {})
      .filter(field => req.body[field] === null)
      .concat(['agendaId', 'uid']);

    svc(7196947).merge(
      req.query,
      _.omit(req.body || {}, fieldsToOmit)
   ).then(location => res.json({
      location,
      success: true
    }), next);
  });

  app.use('', (err, req, res, next) => {
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

  //if (process.env.NODE_ENV !== 'test') {
  server.listen(process.env.PORT || 3000, () => {
    // eslint-disable-next-line no-console
    console.log(
      `\nDev server started on => http://localhost:${server.address().port}/`
   );
  });
  //}
})();


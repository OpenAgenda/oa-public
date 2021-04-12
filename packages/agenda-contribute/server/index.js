'use strict';

const _ = require('lodash');
const bodyParser = require('body-parser');
const express = require('express');
const serialize = require('serialize-javascript');

const eventSchema = require('@openagenda/event-form/src/schema');
const formSchemaMw = require('@openagenda/form-schemas/server/middleware');
const logger = require('@openagenda/logs');

const app = express();
const log = logger('index');

const manifest = require('../client/dist/manifest.json');
const defaultMemberSchema = require('./defaultMemberSchema');

const serviceName = require('../package.json').name.split('/').pop();

module.exports = {
  app,
  init,
  dist: express.static(__dirname + '/../client/dist')
}

const config = {
  layout: (content, data) => 'The service is not ready',
  CDNPath: null,
  tiles: null,
  frontAppPath: null,
  interfaces: {}
}

function init(c) {
  Object.assign(config, c);

  if (c.logger) {
    logger.setModuleConfig(c.logger);
  }

  app.get([
    '/',
    '/:step',
    '/:step/:eventUid',
    '/:step/:eventUid/draft',
    '/:step/:eventUid/from/:fromAgendaUid'
  ], (req, res) => {
    log('info', 'sending app canvas for agenda %s', _.get(req, 'agenda.slug'));

    if (!req.config.member.schema) {
      req.config.member.schema = defaultMemberSchema;
    }

    const frontAppInit = {
      config: {
        mode: 'create',
        authorizations: null,
        fromAgenda: _.pick(req.fromAgenda, ['uid', 'title', 'slug']) || null,
        agenda: _.pick(req.agenda, ['uid', 'title', 'slug']),
        ...req.config,
        tiles : config.tiles,
        maxFileSize: config.maxFileSize,
        schemaExtensions: _.get(req, 'schemaExtensions', []),
      },
      state: {
        member: req.member,
        event: req.event
      }
    };

    res.send(config.layout(
      `<div class="agenda-body">
        <div class="js_preload_spin" id="app"></div>
        <script type="application/json" id="init">${serialize(frontAppInit, { isJSON: true })}</script>
        <script defer type="text/javascript" src="${_getClientAppPath()}"></script>
      </div>`, req));
  });

  app.post('/member',
    bodyParser.json(),
    (req, res) => {
      log('info', 'setting member for agenda %s', _.get(req, 'agenda.slug'));

      config.interfaces.setMember(req.agenda, req.user, req.member, req.body)
        .then(() => {
          res.send('ok');
        }, error => {
          log('error', 'could not set member for agenda %s', _.get(req, 'agenda.slug'), error);
          res.status(400).send('nok');
        });
    }
  );

  app.delete('/event/:eventUid/draft', (req, res, next) => {
    config.interfaces.deleteDraftEvent(req.agenda, req.user, req.event).then(() => {
      res.status(200).send('ok');
    });
  });

  app.post([
    '/event',
    '/event/:eventUid',
    '/event/:eventUid/draft',
    '/event/:eventUid/from/:fromAgendaUid'
  ],
    bodyParser.json(),
    _defineEventFileKey,
    _loadEventSchema,
    formSchemaMw.files.cleanFileValues.bind(null, {}),
    formSchemaMw.files.putInTemporary.bind(null, {}),
    // image is processed by event service, other files need to be put to s3
    formSchemaMw.files.uploadFilesToS3.bind(null, { ignore: ['image']}),
  (req, res) => {;
    // this does not transform other fields than file fields
    const postedWithFiles = {
      ...JSON.parse(req.body.data),
      ...(req.fileFieldValues || {})
    };

    log('info', 'setting event on agenda %s', req?.agenda?.slug);

    config.interfaces.setEvent(req, postedWithFiles).then(result => {
      res.json(_.pick(result, [
        'event',
        'success',
        'errors'
     ]));
    }, error => {
      log('error', 'could not set event for agenda %s', req?.agenda?.slug, error);

      res.status(400);
    });
  });

}

function _loadEventSchema(req, res, next) {
  log('loading event schema with extensions');

  req.schema = eventSchema({
    schemaExtensions: _.get(req, 'schemaExtensions', [])
  });

  next();
}


function _defineEventFileKey(req, res, next) {
  log('defining event file key');

  if (req?.event?.fileKey) {
    req.fileKey = req.event.fileKey;

    return next();
  }

  config.interfaces.generateUniqueFileKey().then(fileKey => {
    req.fileKey = fileKey;

    next();
  });
}

function _getClientAppPath() {
  const distFileName = manifest['main.js'];

  if (config.frontAppPath) {
    return config.frontAppPath + '/' + distFileName;
  }

  if (process.env.NODE_ENV === 'development') {
    return '/js/app.js';
  }

  return [
    config.CDNPath + serviceName,
    distFileName
 ].join('/');
}

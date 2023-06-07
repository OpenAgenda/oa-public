'use strict';

const _ = require('lodash');
const cbify = require('@openagenda/utils/cbify');
const agendaSvc = require('../services/agenda');
const cmn = require('../lib/commons-app');
const gaTrack = require('../lib/gaTrack');
const config = require('../config');
const convertFormat = require('./ConvertFormat');
const loadCredentials = require('./loadCredentials');
const buildPDF = require('./buildPDF');

const preMw = [
  cmn.loadLogger('agenda front'),
];

function loadTagSet(req, res, next) {
  const {
    legacy: {
      getTagSet,
    },
  } = req.app.services;

  getTagSet(req.agenda.id).then(tagSet => {
    req.tagSet = tagSet;

    next();
  }, next);
}

function loadCategorySet(req, res, next) {
  const {
    legacy: {
      getCategorySet,
    },
  } = req.app.services;

  getCategorySet(req.agenda.id).then(categorySet => {
    req.categorySet = categorySet;
    next();
  }, next);
}

function loadEmbedUids(req, res, next) {
  config.knex('review_embed').select('uid').where('review_id', req.agenda.id).then(rows => {
    req.embeds = rows.map(r => r.uid);

    next();
  });
}

function sleep(ms) {
  return (req, res, next) => {
    req.log.debug('sleeping for %s milliseconds', ms);

    setTimeout(() => {
      next();
    }, ms);
  };
}

function checkKey(onError) {
  return cbify(async (req, res, next) => {
    if (!req.query.key) {
      return sleep(400)(req, res, next);
    }

    const {
      keys: keysSvc,
    } = req.app.services;

    try {
      const key = await keysSvc({ key: req.query.key }).get();

      if (!key) {
        return onError(req, res, next);
      }
    } catch (e) {
      return onError(req, res, next);
    }

    next();
  });
}

module.exports = app => {
  const {
    members,
    agendas,
  } = app.services;

  app.options('*/events.json*', (req, res) => res.sendStatus(200));

  app.get(
    '/agendas/:uid/events.json',
    preMw,
    checkKey((req, res, _next) => res.status(400).json({ error: 'Provided key is invalid' })),
    loadCredentials,
    convertFormat({ sendJSON: true, ga: ['events', 'export', 'json'] }),
  );

  app.get(
    '/agendas/:uid/settings.json',
    preMw,
    agendaSvc.mw.load('uid'),
    cmn.ifIs('agenda.private', members.mw.loadOrFail),
    loadTagSet,
    loadCategorySet,
    loadEmbedUids,
    gaTrack.mw('settings', 'export', 'json'),
    (req, res) => cmn.renderJson(req, res, _.assign(
      _.pick(req.agenda, ['title', 'description', 'slug', 'url']),
      {
        tagSet: req.tagSet,
        categorySet: req.categorySet,
        locationSet: req.locationSettings,
        customSet: req.agenda.getCustomFieldsConfig(),
        embeds: req.embeds,
      },
    )),
  );

  app.get(
    '/agendas/:uid/events.pdf',
    preMw,
    agendas.mw.loadBy({
      path: 'params.uid',
      field: 'uid',
    }),
    cmn.ifIs('agenda.private', members.mw.loadOrFail),
    gaTrack.mw('events', 'export', 'pdf'),
    buildPDF,
  );
};

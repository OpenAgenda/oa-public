'use strict';

const _ = require('lodash');
const cbify = require('@openagenda/utils/cbify');
const ODSJSONParser = require('@openagenda/legacy/exports/ODSJSONParser');
const agendaSvc = require('../services/agenda');
const cmn = require('../lib/commons-app');
const legacyEventSvc = require('../services/event');
const cacheMw = require('../lib/cache.mw');
const gaTrack = require('../lib/gaTrack.mw');
const config = require('../config');
const convertFormat = require('./ConvertFormat');
const loadCredentials = require('./loadCredentials');
const buildPDF = require('./buildPDF');

const perPage = 20;

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

function json(req, res) {
  const { response } = res.data;

  const events = !_.get(req, 'query.ods', false) ? response.events : ODSJSONParser(req.agenda.tagSet, response.events);

  const result = {
    ...response,
    events,
  };

  if (req.query.callback) {
    return res.send(`${req.query.callback}(${JSON.stringify(result)})`);
  }

  cmn.renderJson(req, res, result);
}

function cacheContent(req, res, next) {
  res.data = {
    settings: req.agenda.getSettings(),
    response: {
      readme: 'Results are paginated. See: https://developers.openagenda.com/export-json-dun-agenda/',
      total: req.total,
      offset: req.offset,
      limit: req.limit,
      events: req.formatted,
    },
  };

  next();
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
    cacheMw('agendas', 'params.uid', 30, [
      agendaSvc.mw.load('uid'),
      loadCredentials,
      convertFormat({ sendJSON: true }),
      cmn.ifIs('agenda.private', members.mw.loadOrFail),
      agendaSvc.mw.search(perPage),
      legacyEventSvc.mw.cleanEvents,
      agendaSvc.mw.decorateEvents(),
      agendaSvc.mw.cleanJson,
      cacheContent,
    ]),
    gaTrack('events', 'export', 'json'),
    json,
  );

  app.get(
    '/agendas/:uid/settings.json',
    preMw,
    agendaSvc.mw.load('uid'),
    cmn.ifIs('agenda.private', members.mw.loadOrFail),
    loadTagSet,
    loadCategorySet,
    loadEmbedUids,
    gaTrack('settings', 'export', 'json'),
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
    gaTrack('events', 'export', 'pdf'),
    buildPDF,
  );
};

'use strict';

const gaTrack = require('../lib/gaTrack.mw');
const agendaSvc = require('../services/agenda');
const cmn = require('../lib/commons-app');
const legacyEventSvc = require('../services/event');
const convertFormat = require('./ConvertFormat');
const loadCredentials = require('./loadCredentials');

const perPage = 20;

const preMw = [
  cmn.redirectLegacySearch,
  agendaSvc.mw.load('uid'),
];

module.exports = app => {
  const { members } = app.services;

  app.get(
    '/agendas/:uid/admin/events.json',
    preMw,
    members.mw.authorizeAdminModOrKey(),
    agendaSvc.mw.search(perPage, true),
    loadCredentials,
    convertFormat({ sendJSON: true, admin: true }),
    legacyEventSvc.mw.cleanEvents,
    agendaSvc.mw.decorateEvents(true),
    agendaSvc.mw.cleanJson,
    gaTrack('events', 'admin/export', 'json'),
    (req, res) => {
      cmn.renderJson(req, res, {
        total: req.total,
        offset: req.offset,
        limit: req.limit,
        events: req.formatted,
      });
    },
  );
};

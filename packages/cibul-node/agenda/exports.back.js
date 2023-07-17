'use strict';

const agendaSvc = require('../services/agenda');
const convertFormat = require('./ConvertFormat');
const loadCredentials = require('./loadCredentials');

const preMw = [
  agendaSvc.mw.load('uid'),
];

module.exports = app => {
  const { members } = app.services;

  app.get(
    '/agendas/:uid/admin/events.json',
    preMw,
    members.mw.authorizeAdminModOrKey(),
    loadCredentials,
    convertFormat({
      sendJSON: true,
      admin: true,
      trackInfos: ['events', 'admin/export', 'json'],
    }),
  );
};

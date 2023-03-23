'use strict';

const _ = require('lodash');
const uuid = require('uuid');
const log = require('@openagenda/logs')('gaTrackExport');
const gaTrackEvent = require('./gaTrackEvent');

function extractGoogleId(req, name) {
  const parts = req.cookies && req.cookies[name] ? req.cookies[name].split('.') : [];

  return parts.length ? `${parts[2]}.${parts[3]}` : undefined;
}

function extractUserInfos(req) {
  const cid = extractGoogleId(req, '_ga') || uuid();
  const _gid = extractGoogleId(req, '_gid');
  const dl = `${req.protocol}://${req.get('host')}${req.originalUrl}`;
  const uip = (req.headers['x-forwarded-for'] || req.ip).split(', ')[0];
  const ua = req.headers['user-agent'];

  return { cid, _gid, dl, uip, ua };
}

function gaTrack(req, agenda, category, action, label) {
  const gaId = agenda?.settings?.tracking?.googleAnalytics;

  if (!gaId) {
    return;
  }
  if (process.env.NODE_ENV !== 'production') {
    return;
  }

  const { cid, ...rest } = extractUserInfos(req);

  gaTrackEvent(gaId, cid, category, action, label, rest)
    .catch(e => log.warn('Tracking error', e));
}

module.exports = gaTrack;

module.exports.mw = (category, action, label) => (req, res, next) => {
  gaTrack(req, req.agenda, category, action, label);
  next();
};

module.exports.batch = events => (req, res, next) => {
  if (!req.agenda) {
    return next ? next() : null;
  }

  const agendaSettings = typeof req.agenda.getSettings === 'function'
    ? req.agenda.getSettings()
    : req.agenda.settings;
  const gaId = _.get(agendaSettings, 'tracking.googleAnalytics');

  if (gaId && process.env.NODE_ENV === 'production') {
    const { cid, ...rest } = extractUserInfos(req);

    gaTrackEvent.batch(gaId, cid, events, rest)
      .catch(e => log.warn('Tracking error', e));
  }

  if (typeof next === 'function') {
    next();
  }
};

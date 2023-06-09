'use strict';

const crypto = require('crypto');
const _ = require('lodash');
const uuid = require('uuid');
const log = require('@openagenda/logs')('gaTrackExport');
const gaTrackEvent = require('./gaTrackEvent');
const ga4TrackEvent = require('./ga4TrackEvent');

function hashString(input) {
  const hash = crypto.createHash('sha256');
  hash.update(input);
  return hash.digest('hex');
}

function extractGoogleId(req, name) {
  const parts = req.cookies && req.cookies[name] ? req.cookies[name].split('.') : [];

  return parts.length ? `${parts[2]}.${parts[3]}` : undefined;
}

function extractGoogleSessionId(req) {
  if (req.cookies && Object.keys(req.cookies).find(k => k.includes('_ga_'))) {
    const key = Object.keys(req.cookies).find(k => k.includes('_ga_'));
    const split = req.cookies[key].split('.');
    return split[3];
  }
  const date = new Date();
  if (req?.user?.uid || req?.agenda?.uid) return hashString(`${req?.user?.uid ?? req?.agenda?.uid}${date.toJSON().substring(0, 10)}`);
  return null;
}

function extractUserInfos(req) {
  const cid = extractGoogleId(req, '_ga') || uuid();
  const _gid = extractGoogleId(req, '_gid');
  const dl = `${req.protocol}://${req.get('host')}${req.originalUrl}`;
  const uip = (req.headers['x-forwarded-for'] || req.ip).split(', ')[0];
  const ua = req.headers['user-agent'];
  const sid = extractGoogleSessionId(req);

  return { cid, sid, _gid, dl, uip, ua };
}

function gaTrack(req, agenda, category, action, label = null) {
  if (!agenda.settings) return;
  const { tracking } = typeof agenda?.settings === 'string' ? JSON.parse(agenda?.settings) : agenda.settings;
  const gaId = tracking?.googleAnalytics;
  const gaSecret = tracking?.googleAnalyticsSecret;
  if (!gaId) {
    return;
  }
  if (process.env.NODE_ENV !== 'production') {
    return;
  }

  const { cid, sid, ...rest } = extractUserInfos(req);

  if (gaId.substr(0, 1) === 'G' && gaSecret) {
    ga4TrackEvent(gaId, gaSecret, cid, sid, category, action, label, rest)
      .then(r => r)
      .catch(e => log.warn('Tracking error', e));
  } else {
    gaTrackEvent(gaId, cid, category, action, label, rest)
      .then(r => r)
      .catch(e => log.warn('Tracking error', e));
  }
}

module.exports = gaTrack;

module.exports.mw = (category, action, label) => (req, res, next) => {
  gaTrack(req, req.agenda, category, action, label);
  next();
};

module.exports.batch = gaEvents => (req, res, next) => {
  if (!req.agenda) {
    return next ? next() : null;
  }

  const agendaSettings = typeof req.agenda.getSettings === 'function'
    ? req.agenda.getSettings()
    : req.agenda.settings;
  const gaId = _.get(agendaSettings, 'tracking.googleAnalytics');

  if (gaId && process.env.NODE_ENV === 'production') {
    const { cid, ...rest } = extractUserInfos(req);

    gaTrackEvent.batch(gaId, cid, gaEvents, rest)
      .catch(e => log.warn('Tracking error', e));
  }

  if (typeof next === 'function') {
    next();
  }
};

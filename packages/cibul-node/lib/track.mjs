import crypto from 'node:crypto';
import uuid from 'uuid';
import logs from '@openagenda/logs';
import gaTrackEvent from './gaTrackEvent.mjs';
import ga4TrackEvent from './ga4TrackEvent.mjs';
import matomoTrack from './matomoTrackEvent.mjs';

const log = logs('trackExport');

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

function track(req, agenda, category, action, label = null) {
  const {
    core,
  } = req.app.services;

  log('tracking');

  const {
    root: rootPath,
    env,
  } = core.getConfig();

  if (env !== 'production') {
    return;
  }

  if (!agenda.settings) return;
  const { tracking } = typeof agenda?.settings === 'string' ? JSON.parse(agenda?.settings) : agenda.settings;
  const gaId = tracking?.googleAnalytics;
  const gaSecret = tracking?.googleAnalyticsSecret;
  const matomoUrl = tracking?.matomoUrl;
  const matomoSiteId = tracking?.matomoSiteId;

  if (!gaId && !matomoUrl) {
    return;
  }

  const { cid, sid, ...rest } = extractUserInfos(req);

  if (gaId) {
    if (gaId.substr(0, 1) === 'G' && gaSecret) {
      ga4TrackEvent(gaId, gaSecret, cid, sid, category, action, label, rest)
        .catch(e => log.warn('Tracking error', e));
    } else {
      gaTrackEvent(gaId, cid, category, action, label, rest)
        .catch(e => log.warn('Tracking error', e));
    }
  }
  if (matomoUrl && matomoSiteId) {
    matomoTrack({
      matomoUrl,
      matomoSiteId,
      category,
      action,
      label,
      rest,
      rootPath,
    }).then(r => log(r))
      .catch(e => log(e));
  }
}

export default track;

export function mw(category, action, label) {
  return (req, res, next) => {
    track(req, req.agenda, category, action, label);
    next();
  };
}

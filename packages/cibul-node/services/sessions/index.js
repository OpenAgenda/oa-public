import load, { loadOrRedirect } from './lib/load.js';

export function init(config) {
  const sessions = { mw: {} };

  sessions.mw.load = load.bind(null, sessions, {
    imageBucketPath: config.s3.mainBucketPath,
  });
  sessions.mw.loadOrRedirect = loadOrRedirect.bind(null, sessions, {
    imageBucketPath: config.s3.mainBucketPath,
  });
  sessions.mw.ifLogged = (fn) => (req, res, next) =>
    (req.user ? fn(req, res, next) : next());
  sessions.mw.ifUnlogged = (fn) => (req, res, next) =>
    (!req.user ? fn(req, res, next) : next());

  return sessions;
}

import load, { loadOrRedirect } from './lib/load.js';

export function init() {
  const sessions = { mw: {} };

  sessions.mw.load = load.bind(null, sessions);
  sessions.mw.loadOrRedirect = loadOrRedirect.bind(null, sessions);
  sessions.mw.ifLogged = (fn) => (req, res, next) =>
    (req.user ? fn(req, res, next) : next());
  sessions.mw.ifUnlogged = (fn) => (req, res, next) =>
    (!req.user ? fn(req, res, next) : next());

  return sessions;
}

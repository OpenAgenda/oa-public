'use strict';

module.exports = message => (req, res) => {
  req.app.services.sessions.setFlash(req, res, message);
  res.redirect(302, '/agendas');
};

module.exports.slashed = (req, res, next) => {
  if (req.url.slice(-1) === '/') {
    return res.redirect(301, '/agendas');
  }
  next();
};

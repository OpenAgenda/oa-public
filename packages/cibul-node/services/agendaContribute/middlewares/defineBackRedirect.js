'use strict';

const log = require('@openagenda/logs')('services/agendaContribute/middlewares/defineBackRedirect');

module.exports = (req, res, next) => {
  req.backRedirect = null;
  try {
    log('decoding redirect %s', req.query.redirect);
    req.backRedirect = Buffer.from(req.query.redirect, 'base64').toString();
  } catch (e) { /* */ }
  next();
};

'use strict';

const sessions = require('@openagenda/sessions');

module.exports = () => (req, res, next) => {
  if (!res.data) {
    return next();
  }

  sessions.middleware.sync('syncResult')(req, res, next);
};

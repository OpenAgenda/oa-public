'use strict';

const config = require('../../config');

module.exports = (req, res, next) => {
  if (!config.superAdminIds.includes(req.user.id)) {
    return res.status(403).json({
      error: 'lol, no.',
      agendaUid: req.params.agendaUid
    });
  }
  next();
}

'use strict';

module.exports = (superAdminIds = []) => (req, res, next) => {
  if (!superAdminIds.includes(req.user.id)) {
    return res.status(403).json({
      error: 'lol, no.',
      agendaUid: req.params.agendaUid
    });
  }
  next();
}
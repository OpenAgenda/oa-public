'use strict';

module.exports = (req, res, next) => {
  if (req.agenda.private) {
    return res.redirect(302, `/v2/agendas/${req.agenda.uid}.prv`);
  }
  next();
}

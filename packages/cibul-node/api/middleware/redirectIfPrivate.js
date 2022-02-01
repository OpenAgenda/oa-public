'use strict';

module.exports = (req, res, next) => {
  const isUIAPI = req.baseUrl === '/api';

  if (!req.agenda.private) {
    return next();
  }

  if (req.path.split('.').pop() === 'prv') {
    return next();
  }

  if (isUIAPI) {
    return res.redirect(302, `/api/agendas/${req.agenda.uid}.prv`);
  }

  return res.redirect(302, `/v2/agendas/${req.agenda.uid}.prv`);
};

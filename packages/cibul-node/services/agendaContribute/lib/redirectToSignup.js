'use strict';

const qs = require('qs');
const base64 = require('@openagenda/utils/base64');

module.exports = function redirectToSignup(req, res) {
  const query = {
    redirect: base64.encode(req.originalUrl)
  };

  if (req.lang !== 'fr') {
    query.lang = req.lang;
  }

  if (req.query.defaults) {
    query.defaults = req.query.defaults;
  }

  res.redirect(302, `/${req.agenda.slug}/signup?${qs.stringify(query)}`);
};

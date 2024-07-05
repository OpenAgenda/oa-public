'use strict';

const labels = require('@openagenda/labels/users/settings');
const getLabels = require('@openagenda/labels/makeLabelGetter')(labels);

module.exports = () => (req, res, next) => {
  const {
    sessions,
  } = req.app.services;

  if (res.data) {
    sessions.setFlash(
      req,
      res,
      getLabels(res.data ? 'changeEmailSuccess' : 'changeEmailFail', req.lang),
    );

    return res.redirect('/home');
  }

  next();
};

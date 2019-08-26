'use strict';

const labels = require('@openagenda/labels/users/settings');
const getLabels = require('@openagenda/labels/makeLabelGetter')(labels);

module.exports = () => (req, res, next) => {
  if (res.data) {
    sessions.setFlash(req, res, getLabels('accountRemoved', req.lang));
  }

  next();
};

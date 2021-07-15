'use strict';

module.exports = mw => (req, res, next) => {
  if (req.params.format !== 'json') {
    return next();
  }

  if (Number(req.query.size) !== -1) {
    return next();
  }

  mw(req, res, next);
};

'use strict';

module.exports = (format, mw) => (req, res, next) => {
  if ([].concat(format).includes(req.params.format)) {
    return mw(req, res, next);
  }
  next();
};

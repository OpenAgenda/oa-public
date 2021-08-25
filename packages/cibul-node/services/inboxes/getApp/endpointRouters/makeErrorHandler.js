'use strict';

module.exports = services => (err, req, res, next) => {
  if (err) {
    if (err.name === 'BadRequest') {
      return res.status(400).json(err);
    }
    if (err.code) {
      res.status(err.code);
      return next(err);
    }

    services.errors('middleware', err);

    res.status(res.code === 200 ? 500 : res.code).json(err);
  }
};

'use strict';

const log = require('@openagenda/logs')(
  'services/eventSearch/handleError'
);

module.exports = (err, req, res, next) => {
  log('error', err);
  if (err?.name === 'NotFoundError') {
    return res.status(err.statusCode).send(null);
  }

  if (err?.name === 'BadRequest') {
    return res.status(err.statusCode).json({
      error: err.detail,
      requested: req.query.aggregations
    });
  }

  if (err) {
    return res.status(500).send();
  }

  next();
};

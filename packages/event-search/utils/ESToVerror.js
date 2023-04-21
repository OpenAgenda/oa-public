'use strict';

const VError = require('@openagenda/verror');

const {
  BadRequest,
  NotFound
} = VError;

module.exports = (err, message) => {
  if (err.meta?.statusCode === 404) {
    return new NotFound(err, message);
  }
  if (err.meta?.statusCode === 400) {
    return new BadRequest(err, message);
  }
  return new VError(err);
}

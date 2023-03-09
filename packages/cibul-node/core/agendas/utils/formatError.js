'use strict';

module.exports = function formatError(error) {
  if (error?.cause?.meta?.body) {
    return error.cause.meta.body.error.reason;
  }

  if (error?.info?.meta?.body?.error?.reason) {
    return error.info.meta.body.error.reason;
  }

  return error;
};

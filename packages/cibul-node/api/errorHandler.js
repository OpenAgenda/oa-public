'use strict';

const _ = require('lodash');
const { VError } = require('@openagenda/verror');
const errors = require('../services/errors');

const handleError = errors.bind(null, 'api');

module.exports = function apiErrorHandler(err, req, res, _next) {
  if ([
    'BadRequestError',
    'NotFoundError',
    'ValidationError',
  ].includes(err.name)) {
    return res.status(err.statusCode).json({
      errors: err.detail,
    });
  }

  if (err.name === 'UnauthorizedError') {
    return res.status(err.statusCode).json({
      message: err.message,
    });
  }

  if (err.name === 'BadRequest') {
    return res.status(err.code).json({
      message: err.message,
      errors: err.info.errors,
      info: _.omit(err.info, ['errors']),
    });
  }

  if ([
    'NotAuthenticated',
    'Forbidden',
    'NotFound',
  ].includes(err.name)) {
    return res.status(err.code).json({
      message: err.message,
      info: err.info,
    });
  }

  handleError(new VError({
    cause: err,
    info: {
      body: req.body,
      query: req.query,
    },
  }), req);

  return res.status(500).json({
    message: 'server trouble.. send an short mail to support to receive detailed feedback: support@openagenda.com',
  });
};

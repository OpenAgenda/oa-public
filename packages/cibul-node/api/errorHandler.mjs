import _ from 'lodash';
import { VError } from '@openagenda/verror';
import errors from '../services/errors.js';

const handleError = errors.bind(null, 'api');

export default function apiErrorHandler(err, req, res, _next) {
  if ([
    'BadRequestError',
    'NotFoundError',
    'ValidationError',
  ].includes(err.name)) {
    return res.status(err.statusCode).json({
      errors: err.detail,
    });
  }

  if (err.name === 'BadRequest') {
    return res.status(err.statusCode || err.code).json({
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
    return res.status(err.statusCode || err.code).json({
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

import _ from 'lodash';
import { VError } from '@openagenda/verror';
import errors from '../services/errors.js';

const handleError = errors.bind(null, 'api');

export default function apiErrorHandler(err, req, res, _next) {
  if (['ValidationError'].includes(err.name)) {
    return res.status(err.statusCode).json({
      errors: err.info.errors,
      times: req.times,
    });
  }

  if (err.name === 'BadRequest') {
    return res.status(err.statusCode || err.code).json({
      message: err.message,
      errors: err.info.errors,
      info: _.omit(err.info, ['errors']),
      times: req.times,
    });
  }

  if (
    ['NotAuthenticated', 'Forbidden', 'NotFound', 'Conflict'].includes(err.name)
  ) {
    return res.status(err.statusCode || err.code).json({
      message: err.message,
      info: err.info,
      times: req.times,
    });
  }

  if (err.name === 'MulterError') {
    return res.status(400).json({
      message: err.message,
      code: err.code,
      field: err.field,
    });
  }

  handleError(
    new VError({
      cause: err,
      info: {
        body: req.body,
        query: req.query,
      },
    }),
    req,
  );

  return res.status(500).json({
    message:
      'server trouble.. send an short mail to support to receive detailed feedback: support@openagenda.com',
  });
}

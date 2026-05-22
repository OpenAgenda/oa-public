// v3 error handler: maps `core`/feathers error names to the public contract
// `{ error: { code, message, details? } }` envelope with the right HTTP status.

import { VError } from '@openagenda/verror';
import errors from '../services/errors.js';

const handleError = errors.bind(null, 'api-v3');

// error.name -> { status, code }. `code` is the stable machine-readable token
// from the contract's Error schema.
const MAPPING = {
  NotAuthenticated: { status: 401, code: 'unauthorized' },
  Forbidden: { status: 403, code: 'forbidden' },
  NotFound: { status: 404, code: 'not_found' },
  BadRequest: { status: 400, code: 'bad_request' },
  ValidationError: { status: 422, code: 'validation_error' },
};

function fieldDetails(err) {
  // Validators surface field errors under `info.errors`; expose them as
  // structured `details` so clients can react per-field.
  const fieldErrors = err?.info?.errors;
  if (fieldErrors && (Array.isArray(fieldErrors) ? fieldErrors.length : true)) {
    return { errors: fieldErrors };
  }
  return undefined;
}

export default function apiV3ErrorHandler(err, req, res, _next) {
  const mapped = MAPPING[err?.name];

  if (mapped) {
    const details = fieldDetails(err);
    return res.status(err.statusCode || mapped.status).json({
      error: {
        code: mapped.code,
        message: err.message,
        ...details ? { details } : {},
      },
    });
  }

  // Unmapped -> log the real cause, return a generic 500 (no internals leaked).
  handleError(
    new VError({
      cause: err,
      info: {
        query: req.query,
        params: req.params,
      },
    }),
    req,
  );

  return res.status(500).json({
    error: {
      code: 'internal_error',
      message:
        'An unexpected error occurred. Please contact support@openagenda.com.',
    },
  });
}

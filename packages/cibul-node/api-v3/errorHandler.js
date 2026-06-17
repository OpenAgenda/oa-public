// v3 error handler: maps `core`/feathers error names to the public contract
// `{ error: { code, message, details? } }` envelope with the right HTTP status.

import { inspect } from 'node:util';
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
  const details = {};

  // Validators surface field errors under `info.errors`; expose them as
  // structured `details` so clients can react per-field.
  const fieldErrors = err?.info?.errors;
  if (fieldErrors && (Array.isArray(fieldErrors) ? fieldErrors.length : true)) {
    details.errors = fieldErrors;
  }

  // A handler may attach extra machine-readable context under `info.details`
  // (e.g. `mergedIn` on a 404 for a merged location).
  const extra = err?.info?.details;
  if (extra && typeof extra === 'object' && !Array.isArray(extra)) {
    Object.assign(details, extra);
  }

  return Object.keys(details).length ? details : undefined;
}

export default function apiV3ErrorHandler(err, req, res, _next) {
  const mapped = MAPPING[err?.name];

  if (mapped) {
    const details = fieldDetails(err);
    return res.status(err.statusCode || mapped.status).json({
      error: {
        // A handler may carry a more specific machine-readable code than the
        // name-derived default (e.g. `insufficient_scope` for an OAuth scope
        // failure, still a 403 Forbidden). Fall back to the mapped token.
        code: err?.info?.code ?? mapped.code,
        message: err.message,
        ...details ? { details } : {},
      },
    });
  }

  // Unmapped -> log the real cause, return a generic 500 (no internals leaked).
  // Some legacy validators throw plain arrays/objects; VError asserts its
  // cause is an Error, and this handler must never throw itself (Express would
  // fall through to its default HTML 500), so normalize first.
  const cause = err instanceof Error ? err : new Error(`non-Error thrown: ${inspect(err)}`);

  handleError(
    new VError({
      cause,
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

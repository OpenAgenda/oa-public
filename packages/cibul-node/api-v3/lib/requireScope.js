// v3 OAuth scope gate (O4a). Enforces the per-operation scope the contract
// already declares (`security.oauth2` in public/api-spec/openapi.yaml) for any
// caller whose credential carries a scope grant.
//
// Scopes constrain ONLY a scope-bearing credential. The contract's security is
// `bearerAuth: [] OR oauth2: [scope]` — today an OAuth access token is the only
// scoped credential (authenticate.js sets `req.oauth` on that branch). An API
// key, an agenda key, a legacy `tk-` token or a browser session carries NO scope
// model and is governed by its own (visibility tiers, blacklist), so it passes
// through. This is the lever that gives the DCR scope cap teeth: a token the
// user consented to for `events:read` cannot read agendas.
//
// On a missing scope we return 403 with `error.code = "insufficient_scope"` and
// the RFC 6750 §3.1 `WWW-Authenticate: Bearer error="insufficient_scope", …`
// challenge so an OAuth client learns WHICH scope to request next. The body code
// is carried via `info.code`, which the v3 error handler prefers over the
// name-derived default.

import { Forbidden } from '@openagenda/verror';
import { grantedScopesOf } from './scopes.js';

/**
 * Build a middleware that requires `scope` of any scope-bearing caller.
 *
 * @param {string} scope  the scope the matched operation declares (e.g.
 *   'events:read', 'agendas:read').
 * @returns {import('express').RequestHandler}
 */
export default function requireScope(scope) {
  return function enforceScope(req, res, next) {
    const granted = grantedScopesOf(req);
    // Unscoped credential (API key / agenda key / session) → scopes don't apply.
    if (granted === null) {
      return next();
    }
    if (granted.includes(scope)) {
      return next();
    }
    res.setHeader(
      'WWW-Authenticate',
      `Bearer error="insufficient_scope", scope="${scope}", `
        + 'error_description="the access token lacks the required scope"',
    );
    return next(
      new Forbidden(
        { info: { code: 'insufficient_scope', requiredScope: scope } },
        `insufficient scope: "${scope}" is required for this operation`,
      ),
    );
  };
}

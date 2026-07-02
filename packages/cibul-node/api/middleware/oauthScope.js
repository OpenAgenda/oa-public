// v2 OAuth scope enforcement — the v2 twin of api-v3/lib/requireScope.js.
//
// The required scope is declared PER ROUTE, next to mw.member.allow, so it lives
// with the operation (same altitude as v3's requireScope and as the existing
// role guards) — no URL re-parsing. Unlike v3 (which throws a typed error to its
// error handler) these write their own response, per the v2 middleware contract.
//
// Scopes constrain ONLY a scope-bearing caller. Today that is an OAuth access
// token (verifyAndLoadOAuthUser sets `req.oauth`). An api key, agenda key, legacy
// `tk-` token or browser session carries no scope model (`grantedScopesOf` →
// null) and passes through untouched — so every legacy v2 caller is unaffected.
//
// Each gate marks `req.oauthScopeChecked` so `denyUncheckedOAuthScope` (the
// fail-closed backstop, mounted last) can reject an OAuth caller that reached a
// route declaring no scope at all.

import { grantedScopesOf } from '../../api-v3/lib/scopes.js';

// The refusal shared by denyOAuthScope and the backstop: this surface is not
// reachable with ANY consentable scope (no scope grants it).
const NON_CONSENTABLE_MESSAGE = 'this operation is not available with the granted OAuth scopes';

function refuse(res, message, scope) {
  res.setHeader(
    'WWW-Authenticate',
    scope
      ? `Bearer error="insufficient_scope", scope="${scope}", `
          + 'error_description="the access token lacks the required scope"'
      : 'Bearer error="insufficient_scope"',
  );
  return res.status(403).json({ message });
}

/**
 * Require EVERY listed scope of a scope-bearing caller. Pass several when an
 * operation needs all of them (e.g. the transverse search needs both
 * `events:read` and `events:transverse`).
 *
 * @param {...string} required
 * @returns {import('express').RequestHandler}
 */
export function requireScope(...required) {
  return function enforceScope(req, res, next) {
    req.oauthScopeChecked = true;
    const granted = grantedScopesOf(req);
    if (granted === null) {
      return next();
    }
    const missing = required.find((scope) => !granted.includes(scope));
    if (!missing) {
      return next();
    }
    return refuse(
      res,
      `insufficient scope: "${missing}" is required for this operation`,
      missing,
    );
  };
}

// Explicit deny for a route that no OAuth scope covers (superadmin networks /
// supervisor / locationSets, account deletion). Marks the request checked so the
// backstop does not also fire, then refuses any scope-bearing caller while
// letting legacy credentials through unchanged.
export function denyOAuthScope(req, res, next) {
  req.oauthScopeChecked = true;
  if (!req.oauth) {
    return next();
  }
  return refuse(res, NON_CONSENTABLE_MESSAGE);
}

// Fail-closed backstop, mounted after all routes. It refuses an OAuth caller
// whose request reached the END of the stack without any gate having set
// `oauthScopeChecked` — i.e. an unmapped path, or a route whose chain falls
// through to here (its handlers called next() without declaring a scope).
//
// IMPORTANT — this is a net for fall-through, NOT a substitute for per-route
// gating: a matched route that sends its own response without a gate ends the
// middleware chain BEFORE this runs, so it is not caught here. Every responding
// route must still declare requireScope/denyOAuthScope.
export function denyUncheckedOAuthScope(req, res, next) {
  if (req.oauth && !req.oauthScopeChecked) {
    return refuse(res, NON_CONSENTABLE_MESSAGE);
  }
  return next();
}

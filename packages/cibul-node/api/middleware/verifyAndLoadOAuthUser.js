import logs from '@openagenda/logs';
import { isJwsShaped } from '../../api-v3/lib/bearer.js';

const log = logs('api/middleware/verifyAndLoadOAuthUser');

// An OA OAuth access token is a JWS (three base64url segments); an `oa_pk_…`/
// `oa_sk_…` key or a `tk-…` access token never matches (no dots), so this cleanly
// routes only a real Bearer JWT to OAuth verification. The shape test is shared
// (api-v3/lib/bearer.js) with the api-key path and v3 so they cannot diverge.
function extractOAuthToken(req) {
  if (!req.headers.authorization?.startsWith('Bearer ')) return null;
  const value = req.headers.authorization.slice(7);
  return isJwsShaped(value) ? value : null;
}

// v2 OAuth authentication (serves /api and /v2). Accepts an OA-issued OAuth
// access token — the SAME JWS the v3 API accepts (single API resource,
// version-neutral audience). The whole-API resource is one resource server, so
// the in-process verifier (`auth.verifyOAuthAccessToken`) is reused verbatim.
//
// Mounted FIRST in the v2 auth chain, for every verb. Like the other v2 auth
// middlewares it short-circuits on an already-resolved `req.user`, and it
// no-ops when no Bearer JWT is present — so api-key / `tk-` / session / anonymous
// callers are untouched. When a JWT IS present it OWNS the outcome: it writes its
// own response (the v2 contract) and never falls through to the api-key path
// (which would mis-verify the JWT as a public key and emit a misleading 403).
//
// An OAuth token authenticates as its consenting user with that user's full
// visibility (like an `sk` key). What the token may DO is then bounded by its
// scopes — see `requireScope` (declared per route) and `denyUncheckedOAuthScope`
// (the fail-closed backstop) in `oauthScope.js`.
export default async (req, res, next) => {
  if (req.user) {
    return next();
  }

  const token = extractOAuthToken(req);
  if (!token) {
    return next();
  }

  const { auth } = req.app.services;
  // Degrade to the legacy chain when auth is absent (test apps mount v2 without
  // it) — consistent with verifyAndLoadAgendaOrUserFromKey's optional `auth`.
  if (!auth) {
    return next();
  }

  // `verifyOAuthAccessToken` bubbles a genuine infra fault (a JWKS load failure),
  // and `core.users.get` can reject on a DB fault. Express 4 does NOT forward an
  // async middleware's rejection — left unhandled it would hang the socket and
  // raise an unhandledRejection — so route any throw to the shared error handler
  // explicitly (a clean 500). Mirrors api-v3/lib/authenticate.js.
  try {
    const verified = await auth.verifyOAuthAccessToken(token);
    if (!verified) {
      res.setHeader('WWW-Authenticate', 'Bearer error="invalid_token"');
      return res
        .status(401)
        .json({ message: 'invalid or expired OAuth token' });
    }

    const user = await req.app.core.users.get(verified.userUid, {
      detailed: true,
    });
    if (!user) {
      log('OAuth token resolved no user', { userUid: verified.userUid });
      res.setHeader('WWW-Authenticate', 'Bearer error="invalid_token"');
      return res.status(401).json({ message: 'invalid OAuth token' });
    }
    if (user.isBlacklisted) {
      return res.status(403).json({ message: 'user is blacklisted' });
    }

    // Carry the grant for the downstream scope gate.
    req.oauth = { scopes: verified.scopes, clientId: verified.clientId };
    req.user = user;

    // Structured sign-in signal for an OAuth call landing on v2 — a distinct
    // event (not `auth.signin.*`) so v2-OAuth usage is countable on its own,
    // keyed like the other auth events (snake_case `user_uid`). The per-request
    // scope outcome is owned by the scope gate downstream, not logged here.
    log('info', 'auth.v2.oauth', {
      event: 'auth.v2.oauth',
      client_id: verified.clientId,
      user_uid: user.uid,
    });

    return next();
  } catch (err) {
    return next(err);
  }
};

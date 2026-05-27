// v3 authentication: resolves the caller (user public key, agenda key, or
// legacy `tk-` access token) and throws TYPED errors so the v3 error handler
// renders the `{ error: { code, message } }` envelope with the right status.
//
// Unlike the v2 `verifyAndLoadAgendaOrUserFromKey` middleware (which it
// replaces on the /v3 path), this never writes a response itself:
//   - no credentials / unresolvable credentials -> NotAuthenticated (401)
//   - resolved user is blacklisted               -> Forbidden (403)
// The v2 middleware is left untouched — it stays correct for /api (UI) and /v2.

import { NotAuthenticated, Forbidden } from '@openagenda/verror';

function extractPublicKey(req) {
  if (!req.headers.authorization?.startsWith('Bearer ')) {
    return req.query.key ?? req.headers.key;
  }
  const value = req.headers.authorization.slice(7);
  // `Bearer tk-…` is a legacy access token, not a public key.
  return value?.startsWith('tk-') ? null : value;
}

function extractAccessToken(req) {
  if (req.headers.authorization?.startsWith('Bearer tk-')) {
    return req.headers.authorization.slice(7);
  }
  return req.headers['access-token'] ?? null;
}

export default function createAuthenticate(core) {
  const { keys: keysSvc } = core.services;

  return async function authenticate(req, res, next) {
    try {
      // Parity with v2: a browser session may already have populated req.user.
      if (req.user) {
        return next();
      }

      const publicKey = extractPublicKey(req);
      const accessToken = publicKey ? null : extractAccessToken(req);

      if (!publicKey && !accessToken) {
        throw new NotAuthenticated('missing API credentials');
      }

      // Legacy access-token path. Blacklist is enforced here too (the v2 token
      // path skips it — unifying the check closes that asymmetry on /v3).
      if (accessToken) {
        let user;
        try {
          user = await core.users.get.byAccessToken(accessToken);
        } catch (err) {
          // The legacy tk- primitive throws an untyped Error for any failure
          // (invalid/expired/orphaned token), so we can't cleanly tell a bad
          // token from an infra fault here — treat it as unauthenticated, as v2
          // does. A precise 401-vs-500 split needs typed errors at the source;
          // that lands with the tk- retirement (plan-slice-auth-v3.md, D4).
          if (err?.name === 'Forbidden') throw err; // never mask a 403 as 401
          user = null;
        }
        if (!user) {
          throw new NotAuthenticated('invalid or expired access token');
        }
        if (user.isBlacklisted) {
          throw new Forbidden('user is blacklisted');
        }
        req.user = user;
        return next();
      }

      // Public-key path: resolve a user, then fall back to an agenda key.
      let user;
      try {
        user = await core.users.get.byPublicKey(publicKey);
      } catch (err) {
        // Blacklist (or any explicit Forbidden) is a 403, not a 401 — surface it.
        if (err?.name === 'Forbidden') throw err;
        // Only a genuine "no such key/user" (NotFound) falls through to the
        // agenda-key lookup; an unexpected error (infra/bug) must surface as a
        // 500, not be masked as a 401.
        if (err?.name !== 'NotFound') throw err;
      }

      if (user) {
        req.user = user;
        return next();
      }

      const agendaKey = await keysSvc({
        type: 'agendaFullRead',
        key: publicKey,
      }).get({ cache: true });

      if (agendaKey) {
        req.agendaKey = agendaKey;
        return next();
      }

      throw new NotAuthenticated('invalid API key');
    } catch (err) {
      return next(err);
    }
  };
}

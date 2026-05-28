// v3 authentication: resolves the caller (user public key, agenda key, or
// legacy `tk-` access token) and throws TYPED errors so the v3 error handler
// renders the `{ error: { code, message } }` envelope with the right status.
//
// Unlike the v2 `verifyAndLoadAgendaOrUserFromKey` middleware (which it
// replaces on the /v3 path), this never writes a response itself:
//   - no credentials / unresolvable credentials -> NotAuthenticated (401)
//   - resolved user is blacklisted               -> Forbidden (403)
// The v2 middleware is left untouched — it stays correct for /api (UI) and /v2.
//
// A bare key is verified against the better-auth `apikey` store (hashed lookup
// via `verifyKey`) and the OA owner is rebuilt from the `referenceId` — single
// source of truth. The `tk-` path stays legacy until v2 EOL (those HMAC tokens
// never live in the `apikey` store).

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
  const { auth } = core.services;

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

      // Public-key path: verify against the `apikey` store. A verified key IS
      // in the store; an unresolvable owner (gone/unparseable) is a genuine 401.
      const verified = await auth.verifyKey(publicKey);

      if (!verified) {
        throw new NotAuthenticated('invalid API key');
      }

      if (verified.owner?.kind === 'agenda') {
        // Only `identifier` is read downstream (loadSearchAccess, strict ===),
        // so the bare numeric agenda uid is the complete shape here.
        req.agendaKey = { identifier: verified.owner.agendaUid };
        return next();
      }

      if (verified.owner?.kind === 'user') {
        const user = await core.users.get(verified.owner.userUid, {
          detailed: true,
        });
        if (user) {
          if (user.isBlacklisted) {
            throw new Forbidden('user is blacklisted');
          }
          req.user = user;
          return next();
        }
      }

      throw new NotAuthenticated('invalid API key');
    } catch (err) {
      return next(err);
    }
  };
}

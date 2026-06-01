// v3 authentication: resolves the caller (user public key, agenda key, or
// legacy `tk-` access token) and throws TYPED errors so the v3 error handler
// renders the `{ error: { code, message } }` envelope with the right status.
// It never writes a response itself:
//   - no credentials / unresolvable credentials -> NotAuthenticated (401)
//   - resolved user is blacklisted               -> Forbidden (403)
//
// A bare key is verified against the better-auth `apikey` store (hashed lookup
// via `verifyKey`) and the OA owner is rebuilt from the `referenceId` — single
// source of truth. The `tk-` path is legacy: those HMAC tokens never live in
// the `apikey` store, so they take a separate lookup.

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
      // A browser session may already have populated req.user; skip re-auth.
      if (req.user) {
        return next();
      }

      const publicKey = extractPublicKey(req);
      const accessToken = publicKey ? null : extractAccessToken(req);

      if (!publicKey && !accessToken) {
        throw new NotAuthenticated('missing API credentials');
      }

      // Legacy access-token path. The blacklist is enforced here too.
      if (accessToken) {
        let user;
        try {
          user = await core.users.get.byAccessToken(accessToken);
        } catch (err) {
          // The legacy tk- primitive throws an untyped Error for any failure
          // (invalid/expired/orphaned token), so we can't cleanly tell a bad
          // token from an infra fault here — treat it as unauthenticated. A
          // precise 401-vs-500 split would need typed errors at the source.
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
          req.apiKey = verified;

          // D6.A tier enforcement (visibility): structural public lock for
          // publishable keys. A `pk` resolves its owner (so existence and the
          // blacklist are still checked above) but is NEVER granted the owner's
          // visibility — we leave `req.user` unset, so the route handlers pass
          // no `userUid` and `loadSearchAccess` returns `null` (published-only,
          // public fields). "read-only" is not "public": only withholding
          // `userUid` keeps a moderator's pk (including a legacy `userPublic`
          // key, mirrored as oaKind 'pk') from leaking drafts or role-gated
          // fields when it is embedded client-side.
          //
          // There is no pk write-verb guard here: this middleware is mounted
          // GET-only and v3 is read-only.
          if (verified.oaKind === 'pk') {
            return next();
          }

          // sk (and any user key not classified as pk): authenticate as the
          // owner — `userUid` flows to core, visibility = the owner's role.
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

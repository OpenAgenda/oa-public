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
          req.apiKey = verified;

          // D6.A tier enforcement (visibility), v3 — structural public lock for
          // publishable keys. A `pk` resolves its owner (so existence and the
          // blacklist are still checked above) but is NEVER granted the owner's
          // visibility: we deliberately leave `req.user` unset, so the route
          // handlers pass no `userUid` and `loadSearchAccess` returns `null`
          // (published-only, public fields). "read-only" is not "public" — only
          // withholding `userUid` keeps a moderator's pk (including a legacy
          // `userPublic` key, mirrored as oaKind 'pk') from leaking drafts or
          // role-gated fields when it is embedded client-side.
          //
          // Applies to ALL pk on v3; the v2 middleware cutover is a separate PR
          // (v2 is frozen). No pk write-verb guard here: v3 is read-only and
          // this middleware is mounted GET-only — rejecting a pk on a write verb
          // lands with the v3 write surface (plan-slice-auth-v3.md D4/D6).
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

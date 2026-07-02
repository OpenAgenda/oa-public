// v3 authentication: resolves the caller (OA OAuth access token, user public
// key, agenda key, or legacy `tk-` access token) and throws TYPED errors so the
// v3 error handler
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
import { isJwsShaped } from './bearer.js';

// The OA OAuth access token is a JWS; an `oa_pk_…`/`oa_sk_…` key never matches
// (no dots), so `isJwsShaped` cleanly routes a `Bearer <jwt>` to OAuth
// verification before the api-key path. The shape test is shared (bearer.js)
// with the v2 auth middlewares so the JWT-vs-key routing fork cannot drift.

function extractBearer(req) {
  if (!req.headers.authorization?.startsWith('Bearer ')) return null;
  return req.headers.authorization.slice(7);
}

function extractOAuthToken(req) {
  const value = extractBearer(req);
  return isJwsShaped(value) ? value : null;
}

function extractPublicKey(req) {
  const value = extractBearer(req);
  if (value === null) {
    return req.query.key ?? req.headers.key;
  }
  // `Bearer tk-…` is a legacy access token; `Bearer <jwt>` is an OAuth token —
  // neither is an api-key public key.
  if (value.startsWith('tk-') || isJwsShaped(value)) return null;
  return value;
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

      const oauthToken = extractOAuthToken(req);
      const publicKey = oauthToken ? null : extractPublicKey(req);
      const accessToken = oauthToken || publicKey ? null : extractAccessToken(req);

      if (!oauthToken && !publicKey && !accessToken) {
        throw new NotAuthenticated('missing API credentials');
      }

      // OAuth delegation path: a JWS access token this very AS issued. Verified
      // in-process (signature via the JWKS, issuer, expiry, audience ∈ our
      // validAudiences). Under O2.5 the MCP token-exchanges its `aud=mcp` grant
      // for a short `aud=api` token before reaching here, so the audience the
      // verifier trusts is EXACTLY the v3 resource id (`apiResourceUrl`). A bare
      // `aud=mcp` token (the legacy B2 passthrough) is always rejected — and when
      // no API resource is configured the trusted set is EMPTY, so every OAuth
      // token is rejected (API keys still work) — see plan-oauth-provider.md §O2.5.
      // The OA uid comes
      // from the private `uid` claim (NOT `sub`, which is the better-auth row id
      // — they differ for every user; see oauthToken.js), so we authenticate as
      // that user exactly like an `sk` key — the executed request carries the
      // consenting user's visibility, never more.
      if (oauthToken) {
        const verified = await auth.verifyOAuthAccessToken(oauthToken);
        if (!verified) {
          throw new NotAuthenticated('invalid or expired OAuth token');
        }
        const user = await core.users.get(verified.userUid, { detailed: true });
        if (!user) {
          throw new NotAuthenticated('invalid OAuth token');
        }
        if (user.isBlacklisted) {
          throw new Forbidden('user is blacklisted');
        }
        // Record the grant for downstream scope checks (v3 is GET-only/read-only
        // today, so no write-scope gate yet — see plan §O2 "scope authorization").
        req.oauth = { scopes: verified.scopes, clientId: verified.clientId };
        req.user = user;
        return next();
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

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
// D3a: a bare key is verified against the better-auth `apikey` store first
// (hashed lookup via `verifyKey`), and the OA owner is rebuilt from the
// `referenceId`. The legacy `key`/`api_key_set` read is kept only as a fallback
// for any drift the D2 backfill + dual-write missed; every fallback hit is
// logged so we know when it's safe to cut. That fallback reads tables dropped
// at D5, so it is removed then. The `tk-` path stays fully legacy until D4
// (those HMAC tokens never live in the `apikey` store).

import logs from '@openagenda/logs';
import { NotAuthenticated, Forbidden } from '@openagenda/verror';

const log = logs('api-v3/authenticate');

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
  const { keys: keysSvc, auth } = core.services;

  // Legacy read of the `key`/`api_key_set` tables — the D3a fallback. Returns
  // `{ user }` or `{ agendaKey }` on a hit, or `null`. Rethrows a Forbidden
  // (blacklist) and any non-NotFound error so they are not masked as a 401.
  async function resolveLegacy(publicKey) {
    let user;
    try {
      user = await core.users.get.byPublicKey(publicKey);
    } catch (err) {
      if (err?.name === 'Forbidden') throw err;
      if (err?.name !== 'NotFound') throw err;
    }
    if (user) return { user };

    const agendaKey = await keysSvc({
      type: 'agendaFullRead',
      key: publicKey,
    }).get({ cache: true });

    return agendaKey ? { agendaKey } : null;
  }

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

      // Public-key path: verify against the `apikey` store first.
      const verified = await auth.verifyKey(publicKey);

      // A verified key IS in the store — resolve its owner here. No legacy
      // fallback past this point: the fallback exists only for keys ABSENT from
      // the store, so a verified-but-unresolvable key (owner gone/unparseable)
      // is a genuine 401, not a drift miss to re-query the legacy tables for.
      if (verified) {
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
      }

      // Key absent from the `apikey` store — legacy drift fallback (the backfill
      // + dual-write should make this unreachable; logged so we know when it's
      // safe to cut). Removed at D5 with the legacy table drop.
      const legacy = await resolveLegacy(publicKey);
      if (legacy) {
        log('warn', 'apikey verify miss, served via legacy fallback', {
          via: legacy.user ? 'user' : 'agenda',
        });
        // byPublicKey already throws Forbidden on a blacklisted user, so a
        // resolved legacy user is safe to set as-is (parity with the v2 path).
        if (legacy.user) {
          req.user = legacy.user;
        } else {
          req.agendaKey = legacy.agendaKey;
        }
        return next();
      }

      throw new NotAuthenticated('invalid API key');
    } catch (err) {
      return next(err);
    }
  };
}

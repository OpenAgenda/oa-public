import logs from '@openagenda/logs';
import verifyAndLoadAccessTokenUser from './verifyAndLoadAccessTokenUser.js';

const log = logs('api/middleware/verifyAndLoadAgendaOrUserFromKey');

function extractPublicKey(req) {
  if (!req.headers.authorization?.startsWith('Bearer ')) {
    return req.query.key ?? req.headers.key;
  }

  const publicKey = req.headers.authorization.slice(7);

  if (publicKey?.startsWith('tk-')) {
    log('is token, not public key');
    return null;
  }

  return publicKey;
}

// Legacy read of the `key`/`api_key_set` tables — the D3a′ drift fallback, hit
// only for a public key absent from the `apikey` store. Returns `{ user }` |
// `{ agendaKey }` | `{ loadUserError }`. `byPublicKey` throws (Forbidden on a
// blacklisted user, NotFound otherwise); we keep its error for the 403 message,
// exactly as the pre-bascule code did. Removed at D5 with the table drop.
async function resolveLegacy(req, publicKey) {
  const { keys: keysSvc } = req.app.services;
  let loadUserError;

  const user = await req.app.core.users.get.byPublicKey(publicKey).then(
    (u) => u,
    (e) => {
      loadUserError = e;
      return null;
    },
  );
  if (user) return { user };

  // No public key (e.g. a credential-less /v2 GET) → no agenda-key lookup: the
  // keys service validates its `key` and would throw. Mirrors the pre-bascule
  // `if (!req.user && publicKey)` guard; falls through to the 403.
  if (publicKey) {
    const agendaKey = await keysSvc({
      type: 'agendaFullRead',
      key: publicKey,
    }).get({ cache: true });
    if (agendaKey) return { agendaKey };
  }

  return { loadUserError };
}

// v2 key authentication (serves /api and /v2). Unlike the v3 path it keeps its
// own contract: writes a 403 `{ message }` itself, and lets the UI API (`/api`)
// through anonymously when no key is presented.
//
// D3a′: a public key is verified against the better-auth `apikey` store first
// (when `auth` is wired — always in prod; some test apps mount this without it
// and stay on the legacy read), then the OA owner is rebuilt from the
// referenceId. The legacy `key`/`api_key_set` read is kept only as a drift
// fallback. The `tk-` access-token path is delegated untouched (legacy until
// D4 — those HMAC tokens never live in the `apikey` store).
export default async (req, res, next) => {
  log('evaluating', { baseUrl: req.baseUrl });
  const { auth } = req.app.services;

  if (req.user) {
    log('user is already loaded');
    return next();
  }

  const publicKey = extractPublicKey(req);

  if (
    !publicKey
    && (req.headers['access-token']
      || req.headers.authorization?.startsWith('Bearer tk-'))
  ) {
    log('public key is not available, looking at access token');
    return verifyAndLoadAccessTokenUser(req, res, next);
  }

  const isUIAPI = req.baseUrl === '/api';

  if (isUIAPI && !publicKey) {
    log('is UI API, authentication is not required');
    return next();
  }

  // Verify against the apikey store first. A verified key IS in the store, so
  // no legacy fallback past this point: a verified-but-unresolvable key (owner
  // gone/unparseable) is a genuine 403, not a drift miss.
  const verified = auth ? await auth.verifyKey(publicKey) : null;

  if (verified) {
    if (verified.owner?.kind === 'agenda') {
      // Only `.identifier` is read downstream (loadSearchAccess, usageCounters).
      req.agendaKey = { identifier: verified.owner.agendaUid };
      return next();
    }

    if (verified.owner?.kind === 'user') {
      const user = await req.app.core.users.get(verified.owner.userUid, {
        detailed: true,
      });
      if (user?.isBlacklisted) {
        return res.status(403).json({ message: 'user is blacklisted' });
      }
      if (user) {
        req.user = user;
        return next();
      }
    }

    return res.status(403).json({
      message: 'could not find user or agenda matching key',
    });
  }

  // Drift fallback — legacy `key`/`api_key_set` read (removed at D5).
  const legacy = await resolveLegacy(req, publicKey);

  if (legacy.user) {
    // byPublicKey already 403s a blacklisted user (via throw), so a resolved
    // legacy user is safe to set as-is.
    req.user = legacy.user;
    return next();
  }

  if (legacy.agendaKey) {
    req.agendaKey = legacy.agendaKey;
    return next();
  }

  return res.status(403).json({
    message:
      legacy.loadUserError?.message
      ?? 'could not find user or agenda matching key',
  });
};

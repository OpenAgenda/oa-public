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

// v2 key authentication (serves /api and /v2). Unlike the v3 path it keeps its
// own contract: writes a 403 `{ message }` itself, and lets the UI API (`/api`)
// through anonymously when no key is presented.
//
// A public key is verified against the better-auth `apikey` store, then the OA
// owner is rebuilt from the referenceId. The `tk-` access-token path is
// delegated untouched (legacy until v2 EOL — those HMAC tokens never live in
// the `apikey` store).
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

  const verified = auth ? await auth.verifyKey(publicKey) : null;

  if (!verified) {
    return res.status(403).json({
      message: 'could not find user or agenda matching key',
    });
  }

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
};

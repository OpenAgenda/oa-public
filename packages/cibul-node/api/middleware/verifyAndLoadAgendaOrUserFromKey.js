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

export default async (req, res, next) => {
  log('evaluating', { baseUrl: req.baseUrl });
  let loadUserError;
  const { keys: keysSvc } = req.app.services;

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

  req.user = await req.app.core.users.get.byPublicKey(publicKey).then(
    (u) => u,
    (e) => {
      loadUserError = e;
    },
  );

  if (!req.user && publicKey) {
    log('user is not loaded, looking at agenda key');
    req.agendaKey = await keysSvc({
      type: 'agendaFullRead',
      key: publicKey,
    }).get({ cache: true });
  }

  try {
    if (!req.user && !req.agendaKey) {
      log('user and agenda keys are not loaded, throwing error');
      throw new Error(
        loadUserError?.message ?? 'could not find user or agenda matching key',
      );
    }
  } catch (e) {
    return res.status(403).json({
      message: e.message,
    });
  }

  next();
};

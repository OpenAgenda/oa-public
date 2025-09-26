import verifyAndLoadAccessTokenUser from './verifyAndLoadAccessTokenUser.js';

function extractPublicKey(req) {
  let publicKey;

  const authHeader = req.headers.authorization;
  if (authHeader) {
    publicKey = authHeader.startsWith('Bearer ')
      ? authHeader.slice(7)
      : authHeader;
    if (publicKey.startsWith('tk-')) {
      // is accessToken
      return null;
    }
  }

  if (!publicKey) {
    publicKey = req.query.key ?? req.headers.key;
  }

  return publicKey;
}

export default async (req, res, next) => {
  let loadUserError;
  const { keys: keysSvc } = req.app.services;

  if (req.user) {
    return next();
  }

  const publicKey = extractPublicKey(req);

  if (
    !publicKey
    && (req.headers['access-token']
      || req.headers.authorization?.startsWith('Bearer tk-'))
  ) {
    return verifyAndLoadAccessTokenUser(req, res, next);
  }

  const isUIAPI = req.baseUrl === '/api';

  if (isUIAPI && !publicKey) {
    return next();
  }

  req.user = await req.app.core.users.get.byPublicKey(publicKey).then(
    (u) => u,
    (e) => {
      loadUserError = e;
    },
  );

  if (!req.user && publicKey) {
    req.agendaKey = await keysSvc({
      type: 'agendaFullRead',
      key: publicKey,
    }).get({ cache: true });
  }

  try {
    if (!req.user && !req.agendaKey) {
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

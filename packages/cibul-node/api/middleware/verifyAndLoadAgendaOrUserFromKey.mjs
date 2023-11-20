import verifyAndLoadAccessTokenUser from './verifyAndLoadAccessTokenUser.mjs';

export default async (req, res, next) => {
  const {
    accessTokens,
    keys: keysSvc,
  } = req.app.services;

  if (req.user) {
    return next();
  }

  const publicKey = req.query.key ?? req.headers.key;

  if (!publicKey && req.headers['access-token']) {
    return verifyAndLoadAccessTokenUser(req, res, next);
  }

  const isUIAPI = req.baseUrl === '/api';

  if (isUIAPI && !publicKey) {
    return next();
  }

  req.user = await accessTokens.getUserFromKey(publicKey).then(u => u, () => null);

  if (!req.user && publicKey) {
    req.agendaKey = await keysSvc({
      type: 'agendaFullRead',
      key: publicKey,
    }).get({ cache: true });
  }

  try {
    if (!req.user && !req.agendaKey) {
      throw new Error('could not find user or calendar matching key');
    }
  } catch (e) {
    return res.status(403).json({
      message: e.message,
    });
  }

  next();
};

import verifyAndLoadAccessTokenUser from './verifyAndLoadAccessTokenUser.mjs';

export default async (req, res, next) => {
  const {
    accessTokens,
    keys: keysSvc,
  } = req.app.services;

  if (req.user) {
    return next();
  }

  if (!req.query.key && req.headers['access-token']) {
    return verifyAndLoadAccessTokenUser(req, res, next);
  }

  const isUIAPI = req.baseUrl === '/api';

  if (isUIAPI && !req.query.key) {
    return next();
  }

  req.user = await accessTokens.getUserFromKey(req.query.key).then(u => u, () => null);

  if (!req.user && req.query.key) {
    req.agendaKey = await keysSvc({
      type: 'agendaFullRead',
      key: req.query.key,
    }).get({ cache: true });
  }

  try {
    if (!req.user && !req.agendaKey) {
      throw new Error('could not find user or calendar matching key');
    }
  } catch (e) {
    return res.status(403).json({
      error: e.message,
    });
  }

  next();
};

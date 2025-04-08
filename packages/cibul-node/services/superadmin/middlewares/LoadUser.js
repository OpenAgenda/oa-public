import cmn from '../../../lib/commons-app.js';

export default function LoadUser(type = 'get') {
  return (req, res, next) => {
    const { users: usersSvc } = req.app.services;

    const request = req[type === 'get' ? 'query' : 'body'];

    if (!request.uid) {
      return cmn.renderJson(req, res, {
        success: false,
        message: 'user uid is missing',
      });
    }

    const { uid } = request;

    usersSvc
      .get(uid, { removed: null, detailed: true })
      .then((user) => {
        req.loadedUser = user;

        next();
      })
      .catch(cmn.catchError(req, res));
  };
}

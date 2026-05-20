import _ from 'lodash';

export default async function userBlacklist(base, req, res, next) {
  const { users: usersSvc, auth } = req.app.services;

  const userUid = req.loadedUser.uid;

  try {
    const isBlacklisted = _.get(req.query, 'isBlacklisted', 'true') === 'true';

    req.loadedUser = await usersSvc.patch(
      userUid,
      { isBlacklisted },
      { internal: true },
    );

    if (isBlacklisted && auth) {
      await auth.revokeUserSessions(req.loadedUser.id);
    }
  } catch (err) {
    return next(err);
  }

  if (req.accepts(['json', 'html']) === 'html') {
    return res.redirect(`${base}/users?userUid=${req.loadedUser.uid}`);
  }

  return res.json({ success: true });
}

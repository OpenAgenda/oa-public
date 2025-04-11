export default async function userActivate(base, req, res, next) {
  const { users: usersSvc, mails, core } = req.app.services;

  const config = core.getConfig();

  if (!req.loadedUser.isActivated) {
    try {
      req.loadedUser = await usersSvc.patch(
        req.loadedUser.uid,
        { isActivated: true },
        { internal: true },
      );

      await mails.send({
        template: 'activatedAccount',
        to: req.loadedUser.email,
        lang: req.loadedUser.culture,
        data: {
          activateLink: config.root,
        },
        queue: false,
      });

      if (req.accepts(['json', 'html']) === 'html') {
        return res.redirect(`${base}/users?userUid=${req.loadedUser.uid}`);
      }

      return res.json({ success: true });
    } catch (err) {
      return next(err);
    }
  }

  if (req.accepts(['json', 'html']) === 'html') {
    return res.redirect(`${base}/users?userUid=${req.loadedUser.uid}`);
  }

  return res.json({ success: false });
}

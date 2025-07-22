import cmn from '../../../lib/commons-app.js';

export default function userSignin(req, res) {
  const { sessions } = req.app.services;

  sessions.open(req, res, req.loadedUser, () => {
    res.cookie('loggedAs', '1', {
      expires: req.session.expires,
    });

    if (req.xhr) return cmn.renderJson(req, res, { success: true });

    return res.redirect(302, '/home');
  });
}

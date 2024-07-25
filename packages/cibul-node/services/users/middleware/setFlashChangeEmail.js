import labels from '@openagenda/labels/users/settings.js';
import makeLabelGetter from '@openagenda/labels';

const getLabel = makeLabelGetter(labels);

export default () => (req, res, next) => {
  const {
    sessions,
  } = req.app.services;

  if (res.data) {
    sessions.setFlash(
      req,
      res,
      getLabel(res.data ? 'changeEmailSuccess' : 'changeEmailFail', req.lang),
    );

    return res.redirect('/home');
  }

  next();
};

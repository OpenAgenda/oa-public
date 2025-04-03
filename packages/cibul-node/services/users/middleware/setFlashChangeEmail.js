import logs from '@openagenda/logs';
import labels from '@openagenda/labels/users/settings.js';
import makeLabelGetter from '@openagenda/labels';

const getLabel = makeLabelGetter(labels);

const log = logs('services/users/middleware/setFlashChangeEmail');

export default () => (req, res) => {
  const { sessions } = req.app.services;

  log.info('email changed successfully', {
    operation: 'changeEmail',
    userUid: req.user.uid,
  });

  sessions.setFlash(req, res, getLabel('changeEmailSuccess', req.lang));

  res.redirect('/home');
};

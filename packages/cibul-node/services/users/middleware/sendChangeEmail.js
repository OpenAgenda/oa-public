import logs from '@openagenda/logs';

const log = logs('services/users/middleware/sendChangeEmail');

export default (service) => (req, res, next) => {
  const { mails, core } = req.app.services;

  const config = core.getConfig();

  if (res.data) {
    service
      .get(res.data.uid, { internal: true })
      .then((user) => {
        const email = user.store && user.store.newEmail;
        const token = user.store && user.store.newEmailToken;

        if (!token) {
          return next();
        }

        log.info('sending email for email change confirmation', {
          operation: 'changeEmail',
          userUid: req.user.uid,
        });

        const link = `${config.root}/users/${user.uid}/confirmChangeEmail?token=${token}`;

        mails.send({
          template: 'changeEmail',
          to: email,
          data: {
            link,
          },
          lang: req.lang,
        });

        next();
      })
      .catch(next);
  }
};

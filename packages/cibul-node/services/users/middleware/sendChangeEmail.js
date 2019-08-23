'use strict';

const mails = require('@openagenda/mails');
const config = require('../../../config');

module.exports = service => (req, res, next) => {
  if (res.data) {
    service.get(res.data.uid, { internal: true })
      .then(user => {
        const email = user.store && user.store.newEmail;
        const token = user.store && user.store.newEmailToken;

        if (!token) {
          return next();
        }

        const link = `${config.root}/users/${user.uid}/confirmChangeEmail?token=${token}`;

        mails({
          template: 'changeEmail',
          to: email,
          data: {
            link
          },
          lang: req.lang
        });

        next();

      })
      .catch(next);
  }
};

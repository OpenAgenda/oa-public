import _ from 'lodash';
import { BadRequest } from '@openagenda/verror';
import logs from '@openagenda/logs';

const log = logs('auth/unlinkFacebook');

// Mirrors the signup policy in auth/local.front.js (passwordComplexity +
// passwordMatchCheck): non-empty, zxcvbn score > 0, not equal to the user's
// email or full name, and matching the repeat field.
function validatePassword(req, res, next) {
  const { security } = req.app.services;
  const { password, repeat, email } = req.body || {};
  const errors = [];

  if (!password) {
    errors.push({ field: 'password', code: 'passwordRequired' });
  } else {
    const identifiers = _.pickBy({
      email: email || req.user?.email,
      fullName: req.user?.fullName,
    });
    const { score, isSameAs } = security.passwords.evaluate(password, {
      identifiers,
    });

    if (isSameAs) {
      errors.push({ field: 'password', code: 'passwordSameAsIdentifier' });
    } else if (score === 0) {
      errors.push({ field: 'password', code: 'passwordTooWeak' });
    }
  }

  if (password !== repeat) {
    errors.push({ field: 'repeat', code: 'passwordNotEqual' });
  }

  if (errors.length) {
    return next(new BadRequest({ info: { errors } }));
  }

  return next();
}

// Runs after the requestUnlinkFacebook handler has persisted the pending
// email + hashed password in user.store. Creates a user_token row (which
// triggers the sendToken interface to mail the confirmation link), dropping
// any prior pending token for the same user so resubmissions regenerate.
function send(req, res, next) {
  const { users: usersSvc, tokens: tokensSvc } = req.app.services;

  if (!res.data) {
    return next();
  }

  Promise.resolve()
    .then(async () => {
      const user = await usersSvc.get(res.data.uid, { internal: true });
      const pendingEmail = user?.store?.unlinkFacebookEmail;

      if (!pendingEmail) {
        return;
      }

      const existing = await tokensSvc.findOne({
        query: { userId: user.id, type: 'uf' },
      });

      if (existing) {
        await tokensSvc.remove(existing.id);
      }

      log.info('sending migration confirmation email with token', {
        userUid: user.uid,
        pendingEmail,
      });

      await tokensSvc.create(
        {
          userId: user.id,
          email: pendingEmail,
          type: 'unlinkFacebook',
        },
        { user },
      );
    })
    .then(() => next(), next);
}

export default {
  validatePassword,
  send,
};

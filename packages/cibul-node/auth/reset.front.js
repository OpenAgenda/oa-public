import _ from 'lodash';
import logs from '@openagenda/logs';
import labels from '@openagenda/labels/auth/errors.js';
import makeLabelGetter from '@openagenda/labels';
import cmn from '../lib/commons-app.js';
import config from '../config/index.js';
import { wantsJson } from './lib/utils.js';

const log = logs('auth/reset.front');

const getLabel = makeLabelGetter(labels);

/**
 * controllers
 */

function _ifValueIs(name, expected, func) {
  return (values) => {
    if (expected === values[name]) return func(values);

    return values;
  };
}

function _ifValueIsNot(name, expected, func) {
  return (values) => {
    if (expected !== values[name]) return func(values);

    return values;
  };
}

function _render(req, res, uri, _data) {
  return (values) => {
    cmn.render(req, res, uri, values);

    values.resolved = true;

    return values;
  };
}

function _redirectToSignin(req, res, message) {
  const { sessions } = req.app.services;

  return (values) => {
    sessions.setFlash(req, res, message);

    res.redirect(302, '/signin');

    values.resolved = true;

    return values;
  };
}

async function _createAndSend(services, values) {
  log('creating activation token');

  const { users: usersSvc, tokens: tokensSvc } = services;

  const user = values.user
    ? _.pick(values.user, 'id', 'uid', 'email')
    : { email: values.email };

  if (user.id && user.email && user.isActivated) {
    log('user is already loaded: %s', JSON.stringify(user));

    return values;
  }

  log('loading user based on values %s', JSON.stringify(user));

  const result = await usersSvc.findOne({ query: user, detailed: true });

  log('loaded user %s', JSON.stringify(result));

  if (!result) throw new Error(getLabel('userNotFound', values.req.lang));

  values.user = result;

  let token = await tokensSvc.findOne({
    query: {
      userId: values.user.id,
      email: values.user.email,
      type: 'lp',
    },
  });

  if (token) {
    await tokensSvc.config.interfaces.sendToken(
      config,
      services,
    )({ result: token, params: { user: values.user } });
  } else {
    token = await tokensSvc.create(
      {
        userId: values.user.id,
        email: values.user.email,
        type: 'lp',
      },
      { user: values.user },
    );
  }

  values.token = token.token;
  values.sent = true;

  log('info', 'lost password token created for %s', values.user.email);

  return values;
}

async function _verifyToken(services, values) {
  const { tokens: tokensSvc } = services;

  const token = await tokensSvc.findOne({
    query: {
      token: values.token,
      type: 'lp',
    },
  });

  values.valid = !!token;

  values.loadedToken = token;

  if (!values.valid) {
    values.message = getLabel('invalidToken', values.req.lang);
  }

  return values;
}

function lostPassword(req, res) {
  cmn.render(req, res, 'auth/lostPassword');
}

function lostPasswordSubmit(req, res) {
  const { services } = req.app;

  if (wantsJson(req)) {
    // Constant-time response so timing doesn't leak whether the email
    // matches a user. The work runs in parallel with a floor delay chosen
    // to exceed typical _createAndSend latency (db lookup + token
    // create/refresh + mailer call), so the floor — not the work — is
    // effectively what gates the response. Errors are logged, never
    // surfaced, so both success and failure paths resolve identically.
    const work = _createAndSend(services, {
      email: req.body.email,
      req,
    }).catch((err) => {
      log('error', 'lost password background failure', err);
    });
    const floor = new Promise((resolve) => setTimeout(resolve, 5000));

    Promise.all([work, floor]).then(() => {
      res.status(200).json({ success: true });
    });
    return;
  }

  _createAndSend(services, { email: req.body.email, req })
    .then(
      _ifValueIs(
        'sent',
        true,
        _redirectToSignin(req, res, getLabel('passwordResetSent', req.lang)),
      ),
    )

    .then(_ifValueIsNot('sent', true, _render(req, res, 'auth/lostPassword')))

    .then(
      () => log('done'),
      (err) => {
        services.sessions.setFlash(req, res, err.message);

        res.redirect('/');
      },
    );
}

function resetPassword(req, res) {
  const { services } = req.app;

  _verifyToken(services, { token: req.params.token, req })
    .then(_ifValueIs('valid', true, _render(req, res, 'auth/resetPassword')))

    .then(
      _ifValueIsNot(
        'resolved',
        true,
        _redirectToSignin(req, res, getLabel('resetLinkOutdated', req.lang)),
      ),
    )

    .then(() => log('done'), cmn.catchError(req, res));
}

async function updatePassword(services, values) {
  const { users: usersSvc, tokens: tokensSvc } = services;

  await _verifyToken(services, values);

  if (values.valid) {
    const result = await usersSvc.findOne({
      query: { id: values.loadedToken.userId },
      detailed: true,
    });

    if (!result) {
      values.message = getLabel('userNotFound', values.req.lang);
    } else {
      values.user = result;
    }

    if (values.user) {
      if (values.password !== values.repeat) {
        values.message = getLabel('passwordsMustMatch', values.req.lang);

        return values;
      }
      if (!values.password.length) {
        values.message = getLabel('fieldCannotBeEmpty', values.req.lang);

        return values;
      }

      try {
        await usersSvc.changePassword(values.user.uid, {
          password: values.password,
        });

        if (!values.user.isActivated) {
          log('activated user on password reset', { userUid: values.user.uid });
          await usersSvc.activate(values.user.uid, {}, { ignoreToken: true });
        }

        values.success = true;
      } catch (e) {
        throw getLabel('passwordCouldNotBeModified', values.req.lang);
      }

      if (values.success) {
        await tokensSvc.remove(values.loadedToken.id);

        log('token was successfully removed');
      }
    }
  }

  return values;
}

function resetPasswordSubmit(req, res) {
  const { services } = req.app;

  updatePassword(services, {
    req,
    token: req.params.token,
    password: req.body.password,
    repeat: req.body.repeat,
  })
    .then(
      _ifValueIs(
        'success',
        true,
        _redirectToSignin(req, res, getLabel('passwordUpdated', req.lang)),
      ),
    )

    .then(
      _ifValueIsNot('resolved', true, _render(req, res, 'auth/resetPassword')),
    )

    .then(() => log('done'), cmn.catchError(req, res));
}

export default (app) => {
  const { sessions } = app.services;

  const preMw = [
    cmn.loadBaseData('oa-main.css'),
    sessions.mw.ifLogged((req, res) => res.redirect(302, '/')),
  ];

  app.get('/password/lost', preMw, lostPassword);
  app.post('/password/lost', preMw, lostPasswordSubmit);
  app.get('/password/reset/:token', preMw, resetPassword);
  app.post('/password/reset/:token', preMw, resetPasswordSubmit);
};

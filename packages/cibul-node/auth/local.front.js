'use strict';

const fs = require('fs');
const axios = require('axios');
const _ = require('lodash');
const qs = require('qs');
const w = require('when');
const invitationsSvc = require('@openagenda/invitations');
const marked = require('marked');
const makeLabelsGetter = require('@openagenda/labels');
const getLabel = makeLabelsGetter(require('@openagenda/labels/auth/signin'));
const getErrorLabel = require('@openagenda/labels')(
  require('@openagenda/labels/auth/errors')
);
const log = require('@openagenda/logs')('auth/local');
const __ = require('@openagenda/labels')(
  require('@openagenda/labels/auth/activation')
);
const cmn = require('../lib/commons-app');
const auth = require('./lib/auth');
const pLib = require('./lib/passport');
const captcha = require('./lib/captcha');
const config = require('../config');

const layouts = require('../services/lib/layouts');
const manualTemplate = _.template(fs.readFileSync(__dirname + '/manual.tpl', 'utf-8'));
const flattenLabels = require('@openagenda/labels/flatten');
const manualLabels = require('@openagenda/labels/auth/manual');

const useOptions = {
  usernameField: 'email',
  passwordField: 'password',
  passReqToCallback: true,
};

const preMw = [
  cmn.https,
  cmn.loadBaseData(auth.layoutData, 'oasfmain.css')
];

const renderManualPage = (
  (labels, lang) => manualTemplate(flattenLabels(labels, lang))
).bind(null, Object.keys(manualLabels)
  .reduce((html, key) => ({
    ...html,
    [key]: Object.keys(manualLabels[key]).reduce((label, lang) => ({
      ...label,
      [lang]: marked(manualLabels[key][lang])
    }), {})
  }), {})
);

module.exports = (app) => {
  const { sessions, agendas } = app.services;

  log('initing');

  pLib.loadStrategy('local', 'passport-local');

  pLib.use('local-signin', 'local', useOptions, _handleSigninRequest);

  app.get(
    '/signin',
    preMw,
    sessions.mw.ifLogged((req, res) => res.redirect(302, '/home')),
    _presetEmail,
    auth.renderSignin
  );

  app.get(
    '/:agendaSlug/signin',
    agendas.mw.load,
    preMw,
    sessions.mw.ifLogged(_redirectToContribute),
    _presetEmail,
    auth.renderSignin
  );


  app.post(
    '/signin',
    preMw,
    sessions.mw.ifLogged((req, res) => res.redirect(302, '/home')),
    signinSubmit
  );

  app.post(
    '/:agendaSlug/signin',
    agendas.mw.load,
    preMw,
    sessions.mw.ifLogged(_redirectToContribute),
    signinSubmit
  );

  app.get(
    '/signup',
    preMw,
    sessions.mw.ifLogged((req, res) => res.redirect(302, '/home')),
    captcha.load,
    _guessFullName,
    auth.renderSignup
  );

  app.get(
    '/:agendaSlug/signup',
    agendas.mw.load,
    preMw,
    sessions.mw.ifLogged(_redirectToContribute),
    captcha.load,
    _guessFullName,
    auth.renderSignup
  );

  app.post(
    '/signup',
    preMw,
    sessions.mw.ifLogged((req, res) => res.redirect(302, '/home')),
    signupSubmit
  );

  app.post(
    '/:agendaSlug/signup',
    agendas.mw.load,
    preMw,
    sessions.mw.ifLogged(_redirectToContribute),
    signupSubmit
  );

  app.get(
    '/signup/complete',
    preMw,
    sessions.mw.ifLogged((req, res) => res.redirect(302, '/home')),
    signupComplete
  );

  app.get(
    '/:agendaSlug/signup/complete',
    agendas.mw.load,
    preMw,
    sessions.mw.ifLogged(_redirectToContribute),
    signupComplete
  );

  app.get(
    '/activate/resend',
    preMw,
    sessions.mw.ifLogged((req, res) => res.redirect(302, '/home')),
    activateResend
  );

  app.get(
    '/:agendaSlug/activate/resend',
    agendas.mw.load,
    preMw,
    sessions.mw.ifLogged(_redirectToContribute),
    activateResend
  );

  app.get(
    '/activate/:token',
    preMw,
    sessions.mw.ifLogged((req, res) => res.redirect(302, '/home')),
    activate
  );

  app.get(
    '/:agendaSlug/activate/:token',
    agendas.mw.load,
    preMw,
    sessions.mw.ifLogged(_redirectToContribute),
    activate
  );
};

function _redirectToContribute(req, res, next) {
  res.redirect(302, `/${req.agenda.slug}/contribute`);
}

function signinSubmit(req, res, next) {
  pLib.authenticate(
    'local-signin',
    {
      badRequestMessage: getLabel('incorrectPassword', req.lang),
    },
    function (err, user, data) {
      if (err) {
        req.log(
          'error',
          'passport could not complete signing and received error',
          err
        );
      }

      w({ err, req, res, data, user })
        .then(
          auth.ifUserLoaded(false, (v) => {
            if (v.err && v.err.name !== 'NotFound') {
              v.req.log(
                'error',
                'user could not be loaded with data %j',
                v.data
              );
            }

            _.merge(v.data, v.req.body);

            return auth.renderSignin(v);
          })
        )

        .then(
          auth.ifUserLoaded(
            true,
            auth.ifUserActivated(false, auth.redirectToResend)
          )
        )

        .then(auth.ifUserLoaded(true, auth.signin))

        .done(auth.done, cmn.catchError(req, res));
    }
  )(req, res, next);
}

function signupSubmit(req, res) {
  const { users } = req.app.services;
  log('signupSubmit');

  w({ req, res, data: req.body })
    .then(_passwordMatchCheck)

    .then(_captchaCheck)

    .then(async (values) => {
      if (values.data.errors) {
        return values;
      }

      const optionals = _.pickBy(
        _.pick(req.query, 'iToken', 'invitation', 'redirect', 'agenda')
      );

      if (req.agenda) {
        optionals.agenda = req.agenda;
      }

      try {
        log('creating user');

        const user = await users.create(
          {
            fullName: req.body.full_name,
            email: req.body.email,
            password: req.body.password,
            culture: req.body.culture || req.lang,
          },
          {
            detailed: true,
            tokenOptionals: optionals,
            optionals,
          }
        );

        if (user) {
          log('created user');
          values.user = user;
        }
      } catch (err) {
        log('error', err);
        values.data.errors = {};

        if (
          err &&
          _.find(err.errors, { field: 'email', code: 'email.invalid' })
        ) {
          values.data.errors = { email: 'invalidEmail' };
        }

        if (
          err &&
          _.find(err.errors, { field: 'password', code: 'string.tooshort' })
        ) {
          values.data.errors = { password: 'passwordTooShort' };
        }

        if (
          err &&
          _.find(err.errors, { field: 'fullName', code: 'required' })
        ) {
          values.data.errors = { fullName: 'fieldCannotBeEmpty' };
        }

        if (err && err.message === 'Already exist') {
          values.data.errors = { email: 'usedEmail' };
        }

        if (_.isObject(err.errors) && Object.keys(err.errors) > 0) {
          values.data.errors = err.errors;
        }
      }

      return values;
    })

    .then(
      auth.ifUserLoaded(
        true,
        auth.ifUserActivated(false, auth.redirectToComplete)
      )
    )

    .then(auth.ifUserLoaded(true, auth.ifUserActivated(true, auth.signin)))

    .then(auth.ifUnresolved(_pLoadCaptcha))

    .then(auth.ifUnresolved(auth.renderSignup))

    .done(auth.done, cmn.catchError(req, res));
}

function signupComplete(req, res) {
  const resendQuery = Object.assign(auth.loadOptionals(req), {
    email: req.query.email,
  });

  cmn.render(req, res, 'auth/activation', {
    indexed: false,
    agenda: req.agenda,
    resend:
      (req.agenda
        ? `/${req.agenda.slug}/activate/resend`
        : '/activate/resend') +
      qs.stringify(resendQuery, { addQueryPrefix: true }),
  });
}

async function activateResend(req, res) {
  const { users, tokens, sessions } = req.app.services;

  if (!req.query.email) {
    auth.renderEmail({ req, res, title: 'Resend activation mail' });
  } else {
    let user;
    let token;

    const optionals = _.pickBy(
      _.pick(req.query, 'iToken', 'invitation', 'redirect', 'agenda')
    );

    try {
      user = await users.findOne({
        query: { email: req.query.email },
        detailed: true,
      });

      if (!user) {
        throw getErrorLabel('noAccountFound', req.lang);
      }

      if (user && user.isActivated) {
        throw getErrorLabel('userAlreadyActivated', req.lang);
      }

      token = await tokens.findOne({
        query: { userId: user.id, email: user.email, type: 'aa' },
      });

      if (token) {
        await users.config.interfaces.sendToken(config)({
          result: token,
          params: { user, optionals },
        });
      } else {
        token = await tokens.create(
          { userId: user.id, email: user.email, type: 'aa' },
          { user, optionals }
        );
      }

      sessions.setFlash(req, res, __('sendAgain', req.lang));

      auth.redirectToComplete({
        ...optionals,
        req,
        res,
        user,
        token: token.token,
      });
    } catch (error) {
      log('error', error);

      auth.renderEmail({
        req,
        res,
        data: {
          errors: { email: error ? error.message || error : error },
          email: req.query.email,
        },
      });
    }
  }
}


async function activate(req, res) {
  const {
    users,
    agendas,
    tokens,
    redisConfigStore
  } = req.app.services;

  const optionals = _.pickBy(
    _.pick(req.query, 'iToken', 'invitation', 'redirect', 'agenda')
  );

  const accountActivationMode = await redisConfigStore('accountActivationMode', {
    defaultValue: 'manual',
    throwOnError: false
  });

  if (accountActivationMode === 'manual') {
    const token = await tokens.findOne({
      query: {
        token: req.params.token,
        type: 'aa'
      },
    });

    if (token) {
      const user = await users.findOne({ query: { id: token.userId }, detailed: true });

      await tokens.remove(token.id);
    }

    const html = renderManualPage(req.lang);

    if (req.agenda) {
      return res.send(layouts.agenda(html, req));
    }

    return res.send(layouts.main(html, {
      lang: req.lang,
      title: getLabel(manualLabels.title, req.lang)
    }));
  }

  try {
    const user = await users.activate(
      0,
      { token: req.params.token },
      { optionals, detailed: true }
    );

    if (!req.query || !req.query.invitation) {
      return auth.signin({ req, res, user });
    }

    invitationsSvc.get(
      { token: req.query.invitation },
      { includeProcessed: true },
      (err, { invitation }) => {
        if (err || !invitation) return auth.signin({ req, res, user });

        const actions = invitation.data.actions.filter(
          (v) => v.name === 'linkMember'
        );

        if (actions.length === 1) {
          const agendaId = actions[0].params[0].agendaId;

          agendas.get({ id: agendaId }, (err, agenda) => {
            if (err) {
              req.log('error', err);
            } else {
              req.agenda = agenda;
            }

            auth.signin({ req, res, user });
          });
        }

        return auth.signin({ req, res, user });
      }
    );
  } catch (err) {
    if (err.message.includes('not found')) {
      return auth.renderInvalidActivation(req, res);
    }

    return cmn.catchError(req, res)(err);
  }
}

function _handleSigninRequest(req, email, password, cb) {
  const { users } = req.app.services;

  users
    .verifyPassword(password, {
      query: { email },
    })
    .then(async (validPassword) => {
      if (!validPassword) {
        return cb(null, null, {
          email,
          password,
          user: null,
          errors: {
            password: getErrorLabel('incorrectPassword', req.lang),
          },
        });
      }

      const user = await users.findOne({ query: { email }, detailed: true });

      cb(null, user, { email, password, user });
    })
    .catch((err) => {
      cb(err);
    });
}

function _pLoadCaptcha(v) {
  return w.promise(function (rs, rj) {
    captcha.load(v.req, v.res, function () {
      rs(v);
    });
  });
}

function _presetEmail(req, res, next) {
  if (!req.query.email) return next();

  auth.renderSignin(req, res, {
    email: req.query.email,
  });
}

function _guessFullName(req, res, next) {
  if (!req.query.email) return next();

  const fullName = auth.fullNameFromEmail(req.query.email);

  if (!fullName) return next();

  auth.renderSignup(req, res, {
    full_name: fullName,
    email: req.query.email,
  });
}

function _passwordMatchCheck(values) {
  if (values.req.body.password !== values.req.body.repeat) {
    if (!values.data.errors) values.data.errors = {};

    values.data.errors.repeat = 'passwordNotEqual';
  }

  return values;
}

async function _captchaCheck(values) {
  if (!config.mtCaptcha.enabled) return values;

  const captchaToken = values.req.body['mtcaptcha-verifiedtoken'];

  if (!captchaToken) {
    throw new Error('MissingCaptcha');
  }

  const { verifyUrl, privateKey } = config.mtCaptcha;
  const remoteIp = values.req.header('x-forwarded-for');
  let result;

  try {
    result = await axios.get(`${verifyUrl}?privatekey=${privateKey}&token=${captchaToken}`);
  } catch (e) {
    log.error('Error with the mtCaptcha service', e);
    values.data.errors = {
      ...values.data.errors,
      captcha: 'captchaTryAgain',
    };
    return values;
  }

  if (!result.data.success) {
    values.data.errors = {
      ...values.data.errors,
      captcha: 'captchaTryAgain',
    };
    return values;
  }

  const { tokenInfo } = result.data;

  // Don't check ip on a local server
  if (!tokenInfo.isDevHost && tokenInfo.ip !== remoteIp) {
    values.data.errors = {
      ...values.data.errors,
      captcha: 'captchaTryAgain',
    };
    return values;
  }

  return values;
}

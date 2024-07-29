import fs from 'node:fs';
import axios from 'axios';
import _ from 'lodash';
import qs from 'qs';
import w from 'when';
import passport from 'passport';
import LocalStrategy from 'passport-local';
import invitationsSvc from '@openagenda/invitations';
import makeLabelGetter from '@openagenda/labels';
import authSigninLabels from '@openagenda/labels/auth/signin.js';
import authErrorsLabels from '@openagenda/labels/auth/errors.js';
import authActivationLabels from '@openagenda/labels/auth/activation.js';
import logs from '@openagenda/logs';
import flattenLabels from '@openagenda/labels/flatten.js';
import manualLabels from '@openagenda/labels/auth/manual.js';
import { fromMarkdownToHTML } from '@openagenda/md';
import cmn from '../lib/commons-app.js';
import config from '../config/index.js';
import layouts from '../services/lib/layouts/index.js';
import * as auth from './lib/auth.js';
import loadCaptcha from './lib/captcha.js';

const log = logs('auth/local');

const getLabel = makeLabelGetter(authSigninLabels);
const getErrorLabel = makeLabelGetter(authErrorsLabels);
const __ = makeLabelGetter(authActivationLabels);

const manualTemplate = _.template(fs.readFileSync(`${import.meta.dirname}/manual.tpl`, 'utf-8'));

const useOptions = {
  usernameField: 'email',
  passwordField: 'password',
  passReqToCallback: true,
};

const preMw = [cmn.loadBaseData(auth.layoutData, 'oa-main.css')];

const renderManualPage = ((labels, lang) => manualTemplate(flattenLabels(labels, lang))).bind(
  null,
  Object.keys(manualLabels).reduce(
    (html, key) => ({
      ...html,
      [key]: Object.keys(manualLabels[key]).reduce(
        (label, lang) => ({
          ...label,
          [lang]: fromMarkdownToHTML(manualLabels[key][lang]),
        }),
        {},
      ),
    }),
    {},
  ),
);

function redirectToContribute(req, res) {
  res.redirect(302, `/${req.agenda.slug}/contribute`);
}

function guessFullName(req, res, next) {
  if (!req.query.email) return next();

  const fullName = auth.fullNameFromEmail(req.query.email);

  if (!fullName) return next();

  auth.renderSignup(req, res, {
    full_name: fullName,
    email: req.query.email,
  });
}

function signinSubmit(req, res, next) {
  const logBundle = {
    ip: req.ip,
    agenda: _.pick(req.agenda, ['slug', 'title', 'uid']),
    email: req.body.email,
  };
  log.info('signin attempt', logBundle);
  passport.authenticate(
    'local-signin',
    {
      badRequestMessage: getLabel('incorrectPassword', req.lang),
    },
    (err, user, data) => {
      if (err) {
        log.info('signin attempt failed', {
          ...logBundle,
          error: err,
        });
      }

      w({ err, req, res, data, user })
        .then(
          auth.ifUserLoaded(false, async v => {
            if (v.err && v.err.name !== 'NotFound') {
              log.info('signin attempt failed', {
                ...logBundle,
                error: v.err,
              });
            }

            _.merge(v.data, v.req.body);

            // slow down a bruteforce
            await new Promise(resolve => setTimeout(resolve, 1000));

            return auth.renderSignin(v);
          }),
        )

        .then(auth.ifUserLoaded(true, auth.ifUserActivated(false, auth.redirectToResend)))

        .then(auth.ifUserLoaded(true, auth.signin))

        .then(v => {
          log.info('signin attempt %s', v.data?.errors ? 'failed' : 'successful', {
            ...logBundle,
            errors: v.data?.errors,
          });
          return v;
        })

        .done(auth.done, cmn.catchError(req, res));
    },
  )(req, res, next);
}

function passwordComplexity(values) {
  const { security } = values.req.app.services;

  const { score, isSameAs } = security.passwords.evaluate(values.req.body.password, {
    identifiers: _.pick(values.req.body, ['full_name', 'email']),
  });

  if (isSameAs) {
    _.set(values, 'data.errors.password', 'isSameAs');
  } else if (score === 0) {
    _.set(values, 'data.errors.password', 'tooWeak');
  }

  return values;
}

function passwordMatchCheck(values) {
  if (values.req.body.password !== values.req.body.repeat) {
    if (!values.data.errors) values.data.errors = {};

    values.data.errors.repeat = 'passwordNotEqual';
  }

  return values;
}

async function captchaCheck(values) {
  if (!config.mtCaptcha.enabled) return values;

  const captchaToken = values.req.body['mtcaptcha-verifiedtoken'];

  if (!captchaToken) {
    log.info('mtCaptcha token is missing');
    throw new Error('MissingCaptcha');
  }

  const { verifyUrl, privateKey } = config.mtCaptcha;
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

  const { tokeninfo: tokenInfo } = result.data;

  log.info('mtCaptcha ip check', {
    tokenInfoIP: tokenInfo.ip,
    ip: values.req.ip,
  });

  return values;
}

function handleSigninRequest(req, email, password, cb) {
  const { users } = req.app.services;

  users
    .verifyPassword(password, {
      query: { email },
    })
    .then(async validPassword => {
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
    .catch(err => {
      cb(err);
    });
}

function pLoadCaptcha(v) {
  return w.promise(rs => {
    loadCaptcha(v.req, v.res, () => {
      rs(v);
    });
  });
}

function signupSubmit(req, res) {
  const { users } = req.app.services;
  const logBundle = {
    ip: req.ip,
    email: req.body.email,
    fullName: req.body.full_name,
    agenda: _.pick(req.agenda, ['slug', 'title', 'uid']),
  };

  log.info('signup attempt', logBundle);

  w({ req, res, data: req.body })
    .then(passwordComplexity)

    .then(passwordMatchCheck)

    .then(captchaCheck)

    .then(async values => {
      if (values.data.errors) {
        log.info('signup attempt failed', { ...logBundle, errors: values.data.errors });
        return values;
      }

      const optionals = _.pickBy(_.pick(req.query, 'iToken', 'invitation', 'redirect', 'agenda'));

      if (req.agenda) {
        optionals.agenda = req.agenda;
      }

      try {
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
          },
        );

        if (user) {
          log.info('signup attempt successful, created user', logBundle);
          values.user = user;
        }
      } catch (err) {
        values.data.errors = {};

        if ((err.errors ?? []).find(({ code, field }) => field === 'fullName' && code === 'string.toolong')) {
          values.data.errors.fullName = 'fullNameTooLong';
        }

        if (err && _.find(err.errors, { field: 'email', code: 'email.invalid' })) {
          values.data.errors = { email: 'invalidEmail' };
        }

        if (err && _.find(err.errors, { field: 'password', code: 'string.tooshort' })) {
          values.data.errors = { password: 'passwordTooShort' };
        }

        if (err && _.find(err.errors, { field: 'fullName', code: 'required' })) {
          values.data.errors = { fullName: 'fieldCannotBeEmpty' };
        }

        if (err && err.message === 'Already exist') {
          values.data.errors = { email: 'usedEmail' };
        }

        if (_.isObject(err.errors) && Object.keys(err.errors) > 0) {
          values.data.errors = err.errors;
        }

        log.info('signup attempt failed', {
          ...logBundle,
          errors: values.data?.errors,
        });
      }

      return values;
    })

    .then(auth.ifUserLoaded(true, auth.ifUserActivated(false, auth.redirectToComplete)))

    .then(auth.ifUserLoaded(true, auth.ifUserActivated(true, auth.signin)))

    .then(auth.ifUnresolved(pLoadCaptcha))

    .then(auth.ifUnresolved(auth.renderSignup))

    .done(auth.done, cmn.catchError(req, res));
}

function presetEmail(req, res, next) {
  if (!req.query.email) return next();

  auth.renderSignin(req, res, {
    email: req.query.email,
  });
}

function signupComplete(req, res) {
  const resendQuery = Object.assign(auth.loadOptionals(req), {
    email: req.query.email,
  });

  cmn.render(req, res, 'auth/activation', {
    indexed: false,
    agenda: req.agenda,
    resend:
      (req.agenda ? `/${req.agenda.slug}/activate/resend` : '/activate/resend')
      + qs.stringify(resendQuery, { addQueryPrefix: true }),
  });
}

async function activateResend(req, res) {
  const { users, tokens, sessions } = req.app.services;

  if (!req.query.email) {
    auth.renderEmail({ req, res, title: 'Resend activation mail' });
  } else {
    let user;
    let token;

    const optionals = _.pickBy(_.pick(req.query, 'iToken', 'invitation', 'redirect', 'agenda'));

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
        await users.config.interfaces.sendToken(
          config,
          req.app.services,
        )({
          result: token,
          params: { user, optionals },
        });
      } else {
        token = await tokens.create({ userId: user.id, email: user.email, type: 'aa' }, { user, optionals });
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
  const { users, agendas, tokens, redis } = req.app.services;

  const optionals = _.pickBy(_.pick(req.query, 'iToken', 'invitation', 'redirect', 'agenda'));

  const accountActivationMode = await redis.get('accountActivationMode') ?? 'manual';

  if (accountActivationMode === 'manual') {
    const token = await tokens.findOne({
      query: {
        token: req.params.token,
        type: 'aa',
      },
    });

    if (token) {
      await users.findOne({ query: { id: token.userId }, detailed: true });

      await tokens.remove(token.id);
    }

    const html = renderManualPage(req.lang);

    if (req.agenda) {
      return res.send(
        layouts.agenda(html, {
          lang: req.lang,
          agenda: req.agenda,
          cspNonce: res.locals.cspNonce,
        }),
      );
    }

    return res.send(
      layouts.main(html, {
        lang: req.lang,
        title: getLabel(manualLabels.title, req.lang),
        cspNonce: res.locals.cspNonce,
      }),
    );
  }

  try {
    const user = await users.activate(0, { token: req.params.token }, { optionals, detailed: true });

    if (!req.query || !req.query.invitation) {
      return auth.signin({ req, res, user });
    }

    invitationsSvc.get({ token: req.query.invitation }, { includeProcessed: true }, (err, { invitation }) => {
      if (err || !invitation) return auth.signin({ req, res, user });

      const actions = invitation.data.actions.filter(v => v.name === 'linkMember');

      if (actions.length === 1) {
        const { agendaId } = actions[0].params[0];

        agendas.get({ id: agendaId }, (e, agenda) => {
          if (e) {
            req.log.error(e);
          } else {
            req.agenda = agenda;
          }

          auth.signin({ req, res, user });
        });
        return;
      }

      return auth.signin({ req, res, user });
    });
  } catch (err) {
    if (err.message.includes('not found')) {
      return auth.renderInvalidActivation(req, res);
    }

    return cmn.catchError(req, res)(err);
  }
}

export default app => {
  const { sessions, agendas } = app.services;

  log('initing');

  passport.use('local-signin', new LocalStrategy(useOptions, handleSigninRequest));

  app.get(
    '/signin',
    preMw,
    sessions.mw.ifLogged((req, res) => res.redirect(302, '/home')),
    presetEmail,
    auth.renderSignin,
  );

  app.get(
    '/:agendaSlug/signin',
    agendas.mw.load,
    preMw,
    sessions.mw.ifLogged(redirectToContribute),
    presetEmail,
    auth.renderSignin,
  );

  app.post(
    '/signin',
    preMw,
    sessions.mw.ifLogged((req, res) => res.redirect(302, '/home')),
    signinSubmit,
  );

  app.post('/:agendaSlug/signin', agendas.mw.load, preMw, sessions.mw.ifLogged(redirectToContribute), signinSubmit);

  app.get(
    '/signup',
    preMw,
    sessions.mw.ifLogged((req, res) => res.redirect(302, '/home')),
    loadCaptcha,
    guessFullName,
    auth.renderSignup,
  );

  app.get(
    '/:agendaSlug/signup',
    agendas.mw.load,
    preMw,
    sessions.mw.ifLogged(redirectToContribute),
    loadCaptcha,
    guessFullName,
    auth.renderSignup,
  );

  app.post(
    '/signup',
    preMw,
    sessions.mw.ifLogged((req, res) => res.redirect(302, '/home')),
    signupSubmit,
  );

  app.post('/:agendaSlug/signup', agendas.mw.load, preMw, sessions.mw.ifLogged(redirectToContribute), signupSubmit);

  app.get(
    '/signup/complete',
    preMw,
    sessions.mw.ifLogged((req, res) => res.redirect(302, '/home')),
    signupComplete,
  );

  app.get(
    '/:agendaSlug/signup/complete',
    agendas.mw.load,
    preMw,
    sessions.mw.ifLogged(redirectToContribute),
    signupComplete,
  );

  app.get(
    '/activate/resend',
    preMw,
    sessions.mw.ifLogged((req, res) => res.redirect(302, '/home')),
    activateResend,
  );

  app.get(
    '/:agendaSlug/activate/resend',
    agendas.mw.load,
    preMw,
    sessions.mw.ifLogged(redirectToContribute),
    activateResend,
  );

  app.get(
    '/activate/:token',
    preMw,
    sessions.mw.ifLogged((req, res) => res.redirect(302, '/home')),
    activate,
  );

  app.get('/:agendaSlug/activate/:token', agendas.mw.load, preMw, sessions.mw.ifLogged(redirectToContribute), activate);
};

import _ from 'lodash';
import qs from 'qs';
import passport from 'passport';
import labels from '@openagenda/labels/auth/messages.js';
import EmailValidator from '@openagenda/validators/email.js';
import makeLabelGetter from '@openagenda/labels';
import logs from '@openagenda/logs';
import cmn from '../../lib/commons-app.js';
import { loadOptionals, render, wantsJson } from './utils.js';
import loadCaptcha from './captcha.js';

const log = logs('auth/lib/auth');
const unlinkFacebookLog = logs('auth/unlinkFacebook');
const getLabel = makeLabelGetter(labels);
const emailValidator = EmailValidator();

const authenticateFields = {
  facebook: 'facebookUid',
  twitter: 'twitterId',
  google: 'googleId',
  twitterScreenName: 'twitterScreenName',
};

const createFields = {
  facebook: 'facebookUid',
  twitter: 'twitterId',
  google: 'googleId',
};

export const renderSignin = render('auth/signin', {
  optionals: {},
  email: '',
  password: '',
  errors: {},
});

export const renderSignup = render('auth/signup', {
  optionals: {},
  full_name: '',
  email: '',
  password: '',
  repeat: '',
  message: '',
  errors: {},
});

export const renderEmail = render('auth/emailForm', {
  optionals: {},
  email: '',
  errors: {},
});

export const renderInvalidActivation = render('auth/invalidActivation', {});

function serviceCreate(fieldName, activate = false) {
  return (values, data, optionals, cb) => {
    const createData = {
      email: data.email,
      fullName: data.fullName,
      culture: data.culture ? data.culture : 'fr',
      isActivated: !!activate,
      [fieldName]: data.id,
    };

    log('creating user with %j', createData);

    const { services } = values.req.app;

    services.users
      .create(createData, {
        detailed: true,
        tokenOptionals: optionals,
        optionals,
      })
      .then((user) => {
        if (user) {
          log('user successfully created');
        }

        return {
          createData,
          user,
          service: { [fieldName]: data.id },
        };
      })
      .then((values2) => cb(null, values2.user, values2), cb);
  };
}

function serviceAuthenticate(fieldName) {
  return (_values, cb) => {
    const { id } = _values.profile;
    const values = {
      fieldName,
      id,
    };

    const { services } = _values.req.app;

    services.users
      .findOne({
        query: { [fieldName]: id },
        detailed: true,
      })
      .then((user) => {
        values.user = user;
      })
      .catch((err) => {
        if (err.name !== 'NotFound') {
          log('error', err);
        }

        if (!values.errors) {
          values.errors = {};
        }

        values.errors.service = 'This user does not exist';
      })
      .then(() => {
        if (!values.user || values.user.isActivated) return values;

        values.inactive = true;

        if (!values.errors) values.errors = {};

        values.errors.message = 'The account matching this email is not activated';

        return values;
      })
      .then(() => cb(null, values.user, values), cb);
  };
}

export async function signin(values) {
  const { req, res, user } = values ?? {};

  let agendaSlug;

  if (values.resolved) {
    return values;
  }

  if (req.query.agenda) {
    agendaSlug = req.query.agenda;
  } else if (req.agenda) {
    agendaSlug = req.agenda.slug;
  }

  values.resolved = true;

  values.req.log.info('signing in user %s', user.email);

  const { services } = req.app;

  // Open a better-auth session for `user`. Phase 3 retired the legacy
  // services.sessions.open() write here for the same reason as in the
  // superadmin sign-as middleware: the hybrid loader reads BA first, so
  // any flow that lands here with a stale BA cookie (e.g. social signin
  // callback or legacy `aa` activation token fallback) would otherwise
  // silently keep the previous identity.
  try {
    await services.auth.openSession({ userId: user.id, req, res });
  } catch (err) {
    req.log.error({ message: 'could not open session', error: err });
  }

  let redirectUrl;

  services.users
    .refresh(user.uid, {
      lastSignin: true,
    })
    .catch((err2) => {
      req.log.error({
        message: 'could not refresh lastSignin',
        error: err2,
      });
    });

  if (req.query.redirect) {
    try {
      redirectUrl = Buffer.from(req.query.redirect, 'base64').toString();
    } catch (e) {
      req.log.error('could not decode redirect %s', req.query.redirect);
    }
  }

  if (user.facebookUid) {
    // Phase-out: always funnel Facebook-linked sessions through the
    // account migration screen, regardless of any ?redirect= target.
    unlinkFacebookLog.info(
      'facebook signin detected, redirecting user to migration page',
      {
        userUid: user.uid,
        facebookUid: user.facebookUid,
      },
    );
    redirectUrl = '/settings/unlinkFacebook';
  }

  const defaultRedirect = agendaSlug ? `/${agendaSlug}/contribute` : '/home';

  if (wantsJson(req)) {
    res.json({ success: true, redirect: redirectUrl || defaultRedirect });
    return values;
  }

  if (redirectUrl) {
    req.log.info('signin in successful, redirecting to %s', redirectUrl);

    res.redirect(redirectUrl);

    return values;
  }

  res.redirect(302, defaultRedirect);

  return values;
}

export function ifUnresolved(cb) {
  return (values) => {
    if (!values.resolved) {
      return cb(values);
    }
    return new Promise((rs) => rs(values));
  };
}

export function ifUserActivated(expected, cb) {
  return (values) => {
    if (!!values.user.isActivated === expected) {
      return cb(values);
    }
    return new Promise((rs) => rs(values));
  };
}

export function ifUserLoaded(loaded, cb) {
  return (values) => {
    if (!!values.user === loaded) {
      return cb(values);
    }
    return new Promise((rs) => rs(values));
  };
}

function errorDefaultMessage(values) {
  if (values.resolved) return values;

  values.req.log.debug('loading default error message');

  if (!values.err) values.err = {};

  if (!values.err.message) {
    values.err.message = labels.genericError[values.req.lang];
  }

  return values;
}

async function errorExistingEmail(values) {
  if (values.resolved) return values;

  values.req.log.debug('checking if account with same email exists');

  if (values?.data?.errors?.email) {
    values.req.log.debug(
      'an account exists with email: %s',
      JSON.stringify(values.profile),
    );

    delete values.data.errors.email;

    values.data.message = labels.accountEmailAlreadyExists[values.req.lang];

    return renderSignin(values);
  }

  return values;
}

export function redirectToComplete(values) {
  let res;

  if (values.resend) {
    res = '/activate/resend';
  } else if (values.req.agenda) {
    res = `/${values.req.agenda.slug}/signup/complete`;
  } else {
    res = '/signup/complete';
  }

  const url = `${res}?${qs.stringify({
    ...loadOptionals(values.req),
    email: values.user.email,
    ...values.req.agenda ? { slug: values.req.agenda.slug } : {},
    ...values.req.originalUrl.indexOf('signin') !== -1
      ? { origin: 'signin' }
      : undefined,
  })}`;

  if (wantsJson(values.req)) {
    values.res.json({
      success: false,
      redirect: url,
      reason: 'activation_required',
    });
    values.resolved = true;
    return values;
  }

  values.res.redirect(302, url);

  values.resolved = true;

  return values;
}

export function redirectToResend(values) {
  values.resend = true;

  return redirectToComplete(values);
}

export function layoutData(req) {
  return {
    optionals: loadOptionals(req),
    agenda: req.agenda ? req.agenda : false,
  };
}

export function fullNameFromEmail(emailInput) {
  let email;

  try {
    email = emailValidator(emailInput);
  } catch (e) {
    return false;
  }

  const parts = email.split('@');

  const name = parts[0]
    .split(/[._]/g)
    .map((s) => s[0].toUpperCase() + s.substr(1))
    .join(' ');

  const at = (parts[1][0].toUpperCase() + parts[1].substr(1)).split('.')[0];

  return `${name} ${at}`;
}

export function done(values) {
  values.req.log.debug('done');
}

function saveOptionals(req, res, additionals) {
  cmn.writeToCookie(req, res, 'signin-optionals', {
    ...loadOptionals(req),
    ...additionals,
  });
}

function restoreOptionals(req, res) {
  const optionals = cmn.readCookie(req, res, 'signin-optionals', true);

  for (const o in optionals) {
    if (Object.prototype.hasOwnProperty.call(optionals, o)) {
      req.query[o] = optionals[o];
    }
  }
}

/**
 * upon reception of service callback, preload agenda or not
 * depending on stored optionals
 */

function serviceCallback(cb) {
  return (req, res, next) => {
    const { agendas: agendasSvc } = req.app.services;

    restoreOptionals(req, res);

    if (!req.query.agenda) {
      return cb(req, res, next);
    }

    req.params.slug = req.query.agenda;

    agendasSvc.middleware.load({
      private: null,
      internal: true,
      namespaces: {
        identifiers: {
          slug: 'params.slug',
        },
      },
    })(req, res, () => {
      cb(req, res, next);
    });
  };
}

function _pLoadCaptcha(v) {
  return new Promise((rs) => {
    loadCaptcha(v.req, v.res, () => {
      rs(v);
    });
  });
}

const exposed = {
  signin,
  layoutData,
  ifUserLoaded,
  ifUserActivated,
  ifUnresolved,
  redirectToComplete,
  redirectToResend,
  loadOptionals,
  saveOptionals,
  restoreOptionals,
  serviceCallback,
  fullNameFromEmail,
  done, // when a controller is done
  errors: {
    defaultMessage: errorDefaultMessage,
    existingEmail: errorExistingEmail,
  },
  renderSignin,
  renderSignup,
  renderEmail,
  renderInvalidActivation,
};

function init(service) {
  const authenticate = serviceAuthenticate(authenticateFields[service]);
  const create = serviceCreate(createFields[service]);

  function attemptAuth(values) {
    values.req.log.debug(
      'attempting authentication for %s with %s',
      service,
      JSON.stringify(values.profile),
    );

    if (values.resolved) {
      values.req.log.debug('already resolved, returning values');

      return values;
    }

    return new Promise((rs) => {
      if (!values.profile) {
        values.req.log.debug('profile is not set');

        return rs(values);
      }

      authenticate(values, (err, user, data) => {
        if (err) values.err = err;

        if (user) {
          values.req.log.debug('user is loaded');
          values.user = user;
        } else {
          values.req.log.debug('no user was loaded');
        }

        if (data) _.merge(values.data, data);

        rs(values);
      });
    });
  }

  /**
   * try to create an account with profile info
   */

  function attemptCreate(values) {
    if (!values.profile) {
      values.req.log.debug(
        'profile data is not in hand, aborting attemptCreate',
        {
          service,
          values,
        },
      );

      if (!values.data) values.data = {};

      values.data.message = getLabel(
        'abortedAuth',
        { service },
        values.req.lang,
      );

      return values;
    }

    if (service === 'facebook' && !values.profile.email) {
      values.req.log.debug(
        'profile email is not in hand, aborting attemptCreate',
        {
          service,
          values,
        },
      );

      if (!values.data) values.data = {};

      values.err = {
        message: getLabel('facebookEmailMissing', values.req.lang),
      };

      return values;
    }

    values.req.log.debug(
      '%s attempting account creation with %s',
      service,
      JSON.stringify(values.profile),
    );

    return new Promise((rs) => {
      const options = loadOptionals(values.req);

      const fullName = values.profile.fullName.length
        ? values.profile.fullName
        : fullNameFromEmail(values.profile.email);

      if (values.req.agenda) options.agenda = values.req.agenda;

      if (!values.profile) {
        return rs(values);
      }

      create(
        values,
        {
          id: values.profile.id,
          email: values.profile.email,
          fullName,
          culture: values.req.lang,
        },
        options,
        (err, user, data) => {
          if (err) values.err = err;

          if (user) {
            values.req.log.debug('account was created');

            values.user = user;
          } else {
            values.req.log.debug('no account was created');
          }

          if (data) {
            values.data = _.merge(values.data ? values.data : {}, data);
          }

          values.req.log.debug(
            'creation attempt completed with user %s and data %s',
            JSON.stringify(values.user),
            JSON.stringify(values.data),
          );

          rs(values);
        },
      );
    });
  }

  /**
   * upon reception of service callback, optionnally create
   * then signin user
   */

  function process(authService, name) {
    return serviceCallback((req, res, next) => {
      passport.authenticate(
        `${authService}-${name}`,
        {},
        (err, profile, data) => {
          new Promise((rs) =>
            rs({
              req,
              res,
              err,
              profile,
              data,
            }))
            .then(attemptAuth)

            .then(ifUserLoaded(false, attemptCreate))

            .then(ifUserLoaded(false, errorExistingEmail))

            .then(
              ifUnresolved(
                ifUserLoaded(true, ifUserActivated(false, redirectToComplete)),
              ),
            )

            .then(
              ifUnresolved(ifUserLoaded(true, ifUserActivated(true, signin))),
            )

            .then(ifUnresolved(ifUserLoaded(false, errorDefaultMessage)))

            .then(
              ifUnresolved(
                ifUserLoaded(
                  false,
                  name === 'signup' ? _pLoadCaptcha : (v) => v,
                ),
              ),
            )

            .then(
              ifUnresolved(
                ifUserLoaded(
                  false,
                  name === 'signup' ? renderSignup : renderSignin,
                ),
              ),
            )

            .then(done, cmn.catchError(req, res));
        },
      )(req, res, next);
    });
  }

  return _.merge(
    {
      create,
      authenticate,
      attemptAuth,
      attemptCreate,
      process,
      errors: {},
    },
    exposed,
  );
}

export default init;

export { loadOptionals };

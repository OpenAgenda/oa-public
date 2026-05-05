import qs from 'qs';
import labels from '@openagenda/labels/auth/messages.js';
import EmailValidator from '@openagenda/validators/email.js';
import logs from '@openagenda/logs';
import cmn from '../../lib/commons-app.js';
import { loadOptionals, render, wantsJson } from './utils.js';

const unlinkFacebookLog = logs('auth/unlinkFacebook');
const emailValidator = EmailValidator();

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

// Open a better-auth session for `user` and redirect.
// Phase 3 retired the legacy services.sessions.open() write here for the same
// reason as in the superadmin sign-as middleware: the hybrid loader reads BA
// first, so any flow that lands here with a stale BA cookie (e.g. legacy `aa`
// activation token fallback) would otherwise silently keep the previous identity.
// Phase 4 OAuth no longer reaches this helper — it's now only used by the
// `aa` activation token fallback in `local.front.js`.
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
    // Phase 4 also enforces this in the BA `/callback/:id` after-hook;
    // the duplicate guard here covers the legacy `aa` token fallback.
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
    res.json({
      success: true,
      redirect: redirectUrl || defaultRedirect,
      verificationEmailSent: !user.isActivated,
    });
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

export function errorDefaultMessage(values) {
  if (values.resolved) return values;

  values.req.log.debug('loading default error message');

  if (!values.err) values.err = {};

  if (!values.err.message) {
    values.err.message = labels.genericError[values.req.lang];
  }

  return values;
}

export async function errorExistingEmail(values) {
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

export function signupSuccess(values) {
  const { req, res, user } = values;

  const completeUrl = `${req.agenda ? `/${req.agenda.slug}` : ''}/signup/complete?${qs.stringify(
    {
      ...loadOptionals(req),
      email: user.email,
      ...req.agenda ? { slug: req.agenda.slug } : {},
    },
  )}`;

  const resendUrl = `${req.agenda ? `/${req.agenda.slug}` : ''}/activate/resend?${qs.stringify(
    {
      ...loadOptionals(req),
      email: user.email,
    },
  )}`;

  if (wantsJson(req)) {
    res.json({
      success: true,
      email: user.email,
      redirect: completeUrl,
      resendUrl,
      verificationEmailSent: !user.isActivated,
    });
    values.resolved = true;
    return values;
  }

  res.redirect(302, completeUrl);
  values.resolved = true;
  return values;
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

export function saveOptionals(req, res, additionals) {
  cmn.writeToCookie(req, res, 'signin-optionals', {
    ...loadOptionals(req),
    ...additionals,
  });
}

export { loadOptionals };

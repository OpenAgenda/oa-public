// 301 redirects for legacy auth URLs that may still be in circulation
// (already-sent emails, bookmarks, third-party docs). The underlying Express
// wrappers (`auth/local.front.js` signin/signup/password handlers,
// `auth/google.front.js`, `auth/facebook.front.js`, `auth/reset.front.js`)
// were retired when the Next.js auth pages started posting directly to
// better-auth (`/api/auth/sign-in/email`, `/api/auth/sign-up/email`,
// `/api/auth/sign-in/social`, etc.).
//
// We send 301 (permanent) since the legacy URLs are gone for good — caches,
// browsers and crawlers can persist the new locations. The query string is
// preserved on every redirect so links carrying `redirect`, `lang`,
// `invitation`, `email`, `callbackURL` etc. keep working.
//
// We deliberately do NOT use `agendas.mw.load` for the `/:agendaSlug/...`
// routes: a redirect doesn't need the agenda row, and pulling it would 404
// for slugs that no longer exist (defeating the point of preserving the
// link). We just take `req.params.agendaSlug` raw and let the Next-side
// page handle the (rare) case of a defunct slug.
//
// No reserved-slug guard: nginx (docker/nginx/server_params) routes
// `/auth/*` to Next directly so cibul-node never sees `/auth/signin` and a
// `/:agendaSlug/signin` collision is impossible. Other top-level paths that
// reach cibul-node (`/api`, `/home`, `/admin`, …) have no `/signin` handler
// of their own — a stray `/api/signin` would 404 today and 301 to
// `/auth/signin?agenda=api` after this front; the bogus `agenda=api` is
// harmless on the Next side and not worth a maintenance-prone allowlist.

import qs from 'qs';

function agendaSigninRedirect(req, res) {
  // The Next signin page has no per-agenda sub-route, so we hoist the slug
  // onto the query as `agenda=<slug>`. `req.query` is spread *after* the
  // synthesized default so an explicit `?agenda=…` from the legacy URL
  // wins.
  const query = { agenda: req.params.agendaSlug, ...req.query };
  res.redirect(
    301,
    `/auth/signin${qs.stringify(query, { addQueryPrefix: true })}`,
  );
}

function agendaSignupRedirect(req, res) {
  const slug = req.params.agendaSlug;
  const query = { ...req.query };
  // The legacy invitation flow on `/:slug/signup` implicitly redirected
  // contributors to `/${slug}/contribute` after activation. The Next page
  // expects this in its `redirect` param. Encode as base64 to mirror the
  // shape used by mailers and links built in the rest of the app.
  if (!query.redirect) {
    query.redirect = Buffer.from(`/${slug}/contribute`, 'utf8').toString(
      'base64',
    );
  }
  res.redirect(
    301,
    `/auth/signup${qs.stringify(query, { addQueryPrefix: true })}`,
  );
}

function buildAgendaSocialRedirect(provider) {
  return (req, res) => {
    const slug = req.params.agendaSlug;
    // Better-auth's `/api/auth/sign-in/social/:provider` is POST-only with
    // a JSON body — we can't 301 a GET request to it. Land the user on the
    // signin page instead, where the Google/Facebook button drives the same
    // flow with one extra click. The `?provider=` hint can be used by the
    // page to auto-trigger the social signin if desired.
    const callbackURL = req.query.callbackURL ?? `/${slug}/contribute`;
    const redirect = Buffer.from(callbackURL, 'utf8').toString('base64');
    const query = { provider, redirect, ...req.query };
    delete query.callbackURL;
    res.redirect(
      301,
      `/auth/signin${qs.stringify(query, { addQueryPrefix: true })}`,
    );
  };
}

function redirectSignin(req, res) {
  res.redirect(
    301,
    `/auth/signin${qs.stringify(req.query, { addQueryPrefix: true })}`,
  );
}

function redirectSignup(req, res) {
  res.redirect(
    301,
    `/auth/signup${qs.stringify(req.query, { addQueryPrefix: true })}`,
  );
}

function redirectPasswordLost(req, res) {
  // LostPassword is a sub-state of Signin (cf. components/auth/Signin.tsx),
  // toggled by the `view=lost` query param.
  const query = { ...req.query, view: 'lost' };
  res.redirect(
    301,
    `/auth/signin${qs.stringify(query, { addQueryPrefix: true })}`,
  );
}

function redirectActivateResend(req, res) {
  // The verification-email-resend panel is a sub-state of Signin
  // (cf. components/auth/Signin.tsx), toggled by `view=resend`. The Next
  // form posts directly to BA `/api/auth/send-verification-email`.
  const query = { ...req.query, view: 'resend' };
  res.redirect(
    301,
    `/auth/signin${qs.stringify(query, { addQueryPrefix: true })}`,
  );
}

function redirectAgendaActivateResend(req, res) {
  // Mirror agendaSigninRedirect: hoist the slug as `agenda=<slug>` so the
  // Next page can rebuild the post-activate redirect target. Explicit
  // `?agenda=…` from the legacy URL wins.
  const query = {
    agenda: req.params.agendaSlug,
    ...req.query,
    view: 'resend',
  };
  res.redirect(
    301,
    `/auth/signin${qs.stringify(query, { addQueryPrefix: true })}`,
  );
}

function redirectPasswordResetQuery(req, res) {
  res.redirect(
    301,
    `/auth/reset${qs.stringify(req.query, { addQueryPrefix: true })}`,
  );
}

function redirectPasswordResetPathToken(req, res) {
  // Legacy `/password/reset/:token` shape (path-param token). Hoist the
  // token onto the query string and merge any extra query the link might
  // have carried.
  const query = { ...req.query, token: req.params.token };
  res.redirect(
    301,
    `/auth/reset${qs.stringify(query, { addQueryPrefix: true })}`,
  );
}

function redirectSocial(provider) {
  return (req, res) => {
    // Same reasoning as buildAgendaSocialRedirect: BA's social endpoint is
    // POST-only, we can't redirect a GET there. Send the user to signin and
    // let them click the social button.
    const query = { provider, ...req.query };
    if (req.query.callbackURL) {
      query.redirect = Buffer.from(req.query.callbackURL, 'utf8').toString(
        'base64',
      );
      delete query.callbackURL;
    }
    res.redirect(
      301,
      `/auth/signin${qs.stringify(query, { addQueryPrefix: true })}`,
    );
  };
}

export default function mountLegacyRedirects(app) {
  // Bare top-level forms.
  app.get('/signin', redirectSignin);
  app.get('/signup', redirectSignup);
  app.get('/password/lost', redirectPasswordLost);
  app.get('/password/reset', redirectPasswordResetQuery);
  app.get('/password/reset/:token', redirectPasswordResetPathToken);
  app.get('/activate/resend', redirectActivateResend);
  app.get('/google/signin', redirectSocial('google'));
  app.get('/facebook/signin', redirectSocial('facebook'));

  // Agenda-aware variants.
  app.get('/:agendaSlug/signin', agendaSigninRedirect);
  app.get('/:agendaSlug/signup', agendaSignupRedirect);
  app.get('/:agendaSlug/activate/resend', redirectAgendaActivateResend);
  app.get('/:agendaSlug/google/signin', buildAgendaSocialRedirect('google'));
  app.get(
    '/:agendaSlug/facebook/signin',
    buildAgendaSocialRedirect('facebook'),
  );
}

import newsletterSubscribe from '../lib/newsletterSubscribe.js';
import config from '../config/index.js';
import cmn from '../lib/commons-app.js';

const preMw = [cmn.loadLogger('general'), cmn.loadBaseData('oa-main.css')];

function serviceConnectCallback(req, res) {
  let stateObj;

  try {
    stateObj = JSON.parse(Buffer.from(req.query.state, 'base64').toString());
  } catch (e) {
    return cmn.catchError(
      req,
      res,
    )({ code: 500, message: 'invalid parameters' });
  }

  res.redirect(
    302,
    req.genUrl('serviceSynchronize', {
      slug: stateObj.slug,
      service: req.params.service,
      code: req.query.code,
    }),
  );
}

function start(req, res) {
  const actions = {
    header_signin: `/signin?lang=${req.lang}`,
    header_signup: `/signup?lang=${req.lang}`,
    header_phone: 'ok',
    main: `/signup?lang=${req.lang}`,
    pricing_free: `/signup?lang=${req.lang}`,
    pricing_custom: config.contactResource,
    pricing_premium: config.contactResource,
    pricing_tailored: config.contactResource,
    bottom: `/signup?lang=${req.lang}`,
    newsletter: '/home',
  };

  let action = Object.keys(actions).filter((v) => req.query.a === v);

  if (!action.length) {
    return res.redirect(301, '/');
  }

  [action] = action;

  req.log.info({
    message: `corpo link: ${action}`,
    action,
    userAgent: req.headers['user-agent'],
  });

  if (actions[action] === 'ok') {
    return res.send('ok');
  }

  res.redirect(301, actions[action]);
}

export default (app) => {
  const { sessions, auth } = app.services;

  app.get(
    '/signout',
    preMw,
    async (req, res, next) => {
      // Sign-as flow: detect impersonation by inspecting BA's session row.
      // When a superadmin used "sign as <user>", `auth.impersonateUser`
      // stamped `impersonatedBy` on the BA session row and stashed the
      // superadmin's token in the signed `oa.admin_session` cookie.
      // /signout in this state means "stop impersonating" — call the BA
      // endpoint, which atomically deletes the impersonated session, restores
      // the superadmin's session_token, and clears the marker cookie.
      if (auth) {
        let baSession = null;
        try {
          baSession = await auth.getSessionFromRequest(req);
        } catch (err) {
          req.log?.warn?.({
            message: 'getSession during /signout failed',
            error: err,
          });
        }

        if (baSession?.session?.impersonatedBy) {
          try {
            await auth.stopImpersonating({ req, res });
            return res.redirect(302, '/');
          } catch (err) {
            req.log?.error?.({
              message:
                'stopImpersonating failed, falling back to clean signout',
              error: err,
            });
          }
        }
      }
      next();
    },
    async (req, res, next) => {
      if (auth) {
        try {
          const out = await auth.api.signOut({
            headers: auth.toHeaders(req),
            asResponse: true,
          });
          auth.forwardSetCookieHeaders(out, res);
        } catch (_err) {
          // log+swallow: legacy cookie-session close below is the source of
          // truth and a missed better-auth signOut never blocks the redirect.
        }
      }
      next();
    },
    sessions.mw.close(),
    (req, res) => res.redirect(302, '/'),
  );

  app.post('/newsletter/subscribe', preMw, newsletterSubscribe);

  app.get('/services/:service/connect/callback', preMw, serviceConnectCallback);

  app.get('/flash', (req, res) => {
    req.app.services.sessions.setFlash(
      req,
      res,
      req.query.message || 'Flash! Aaanhaaan!',
    );
    res.redirect('/');
  });

  app.get('/start', preMw, start);

  app.get('/events', (req, res) => res.redirect(302, '/agendas'));
};

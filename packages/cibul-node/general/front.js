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
  const { sessions } = app.services;

  app.get(
    '/signout',
    preMw,
    sessions.mw.ifUnlogged((req, res) => res.redirect(302, '/')),
    (req, res, next) => {
      if (req.cookies.loggedAs) {
        const sessionId = req.session?.sessionId;
        req.session = sessionId ? { sessionId } : null;
        res.clearCookie('loggedAs');
        return res.redirect(302, '/');
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

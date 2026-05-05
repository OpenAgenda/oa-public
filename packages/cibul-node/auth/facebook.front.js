import logs from '@openagenda/logs';
import cmn from '../lib/commons-app.js';
import { layoutData, saveOptionals } from './lib/auth.js';
import computePostSignInRedirect from './lib/computePostSignInRedirect.js';

const log = logs('auth/facebook.front');

export default (app) => {
  const { sessions, agendas, auth: authSvc } = app.services;
  // Same rationale as google.front.js: guard on the live BA config so the
  // route is mounted iff `Auth({facebook: {...}})` was wired.
  if (!authSvc?.instance?.options?.socialProviders?.facebook) return;

  const preMw = [
    cmn.loadBaseData(layoutData, 'oa-main.css'),
    sessions.mw.ifLogged((req, res) => res.redirect(302, '/')),
  ];

  async function startSocial(req, res, next) {
    try {
      saveOptionals(req, res, req.agenda ? { agenda: req.agenda.slug } : {});
      const callbackURL = computePostSignInRedirect({ req });
      const baResponse = await authSvc.api.signInSocial({
        body: { provider: 'facebook', callbackURL, disableRedirect: true },
        asResponse: true,
      });
      authSvc.forwardSetCookieHeaders(baResponse, res);
      const body = await baResponse.json().catch(() => null);
      if (!body?.url) {
        log('error', 'signInSocial returned no url', {
          status: baResponse.status,
        });
        throw new Error('signInSocial returned no url');
      }
      res.redirect(302, body.url);
    } catch (err) {
      next(err);
    }
  }

  app.get('/facebook/signin', preMw, startSocial);
  app.get('/:agendaSlug/facebook/signin', agendas.mw.load, preMw, startSocial);
};

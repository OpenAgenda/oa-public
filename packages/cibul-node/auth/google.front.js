import logs from '@openagenda/logs';
import cmn from '../lib/commons-app.js';
import { layoutData, saveOptionals } from './lib/auth.js';
import computePostSignInRedirect from './lib/computePostSignInRedirect.js';

const log = logs('auth/google.front');

export default (app) => {
  const { sessions, agendas, auth: authSvc } = app.services;
  // Guard on the actual BA configuration rather than env-var lookup so the
  // route is only mounted when `Auth({google: {...}})` was wired in
  // `services/auth/index.js`. This decouples the front from
  // `config/index.js` and makes it work in test setups (testConfig may
  // carry `auth.google` even when `process.env.OA_OAUTH_GOOGLE_ID` is not
  // set in the test runner's environment).
  if (!authSvc?.instance?.options?.socialProviders?.google) return;

  const preMw = [
    cmn.loadBaseData(layoutData, 'oa-main.css'),
    sessions.mw.ifLogged((req, res) => res.redirect(302, '/')),
  ];

  async function startSocial(req, res, next) {
    try {
      saveOptionals(req, res, req.agenda ? { agenda: req.agenda.slug } : {});
      const callbackURL = computePostSignInRedirect({ req });
      const baResponse = await authSvc.api.signInSocial({
        body: {
          provider: 'google',
          callbackURL,
          // BA redirects here on `account_not_linked` (existing OA user
          // matched by email but not linked yet). The Next /auth/signin page
          // reads `linkProvider`, the form POSTs to cibul-node /signin which
          // runs the password challenge, then triggers /link-social to
          // finalise the linking. See verified-linking flow.
          errorCallbackURL: '/auth/signin?linkProvider=google',
          disableRedirect: true,
        },
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

  app.get('/google/signin', preMw, startSocial);
  app.get('/:agendaSlug/google/signin', agendas.mw.load, preMw, startSocial);
  app.post('/google/signup', preMw, startSocial);
  app.post('/:agendaSlug/google/signup', agendas.mw.load, preMw, startSocial);
};

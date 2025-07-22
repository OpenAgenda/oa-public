import networkApps from './services/networkApps.js';
import abilities from './services/abilities/index.js';
import homeBack from './home/back.js';
import generalFront from './general/front.js';
import sessionBack from './general/session.back.js';
import generalBack from './general/back.js';
import eventBack from './event/back.js';
import eventFront from './event/front.js';
import actionsFront from './event/actions.front.js';
import facebookFront from './auth/facebook.front.js';
import googleFront from './auth/google.front.js';
import localFront from './auth/local.front.js';
import resetFront from './auth/reset.front.js';
import settingsBack from './agenda/settings.back.js';
import members from './services/members/index.js';
import webapp from './webapp/index.js';
import sentry from './services/sentry.js';
import sharesFront from './agenda/shares.front.js';
import agendaFront from './agenda/front.js';
import exportsBack from './agenda/exports.back.js';
import exportsFront from './agenda/exports.front.js';

export default (app) => {
  app.services.users.plugApp(app);
  app.services.mails.plugApp(app);
  app.use(
    '/agendas/:agendaUid/events.v2.:format',
    app.services.eventSearch.apps.agendas.getPublic(),
  );
  app.use(
    '/agendas/:agendaUid/admin/events.v2.:format',
    app.services.eventSearch.apps.agendas.getRestricted(),
  );
  app.use(
    '/agendas/:agendaUid/settings/exports',
    app.services.eventSearch.apps.agendas.getAgendaExportsSettings(),
  );
  app.use(
    '/agendas/:agendaUid/admin/settings/exports',
    app.services.eventSearch.apps.agendas.getAgendaExportsSettings({
      admin: true,
    }),
  );
  app.services.agendaLocations.apps(app, '/locations');
  app.services.agendaLocations.apps.agenda(
    app,
    '/agendas/:agendaUid/locations',
  );
  app.services.agendaLocations.apps.agendaAdmin(
    app,
    '/:agendaSlug/admin/locations',
  );
  app.services.inboxes.plugApp(app);
  app.services.agendaContribute.plugApp(app);
  app.services.agendaEvents.plugApp(app);
  networkApps(app);
  abilities(app);
  app.services.agendaDocx.plugApp(app);
  homeBack(app);
  generalFront(app);
  sessionBack(app);
  generalBack(app);
  eventBack(app);
  eventFront(app);
  actionsFront(app);
  facebookFront(app);
  googleFront(app);
  localFront(app);
  resetFront(app);
  app.services.aggregators.plugApp(app);
  settingsBack(app);
  members(app);
  app.services.stats.plugApp(app);
  app.services.supervisor.plugApp(app, '/supervisor');
  app.services.reports.plugApp(app);
  app.services.dynamicScripts.plugApp(app);
  app.services.activities.plugApp(app);
  webapp(app);
  app.services.agendas.plugApp(app);
  sentry(app);
  sharesFront(app);
  app.services.agendaSearch.plugApp(app, '/agendas');
  agendaFront(app);
  exportsBack(app);
  exportsFront(app);
};

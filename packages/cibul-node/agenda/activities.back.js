import mw from '@openagenda/activity-apps/dist/middleware.js';
import cmn from '../lib/commons-app.js';

export default (app) => {
  const { agendas, members, sessions } = app.services;

  const preMw = [
    cmn.loadLogger('agendaActivities'),
    sessions.mw.ifUnlogged((req, res) => res.redirect(302, '/')),
    cmn.loadAgenda,
    agendas.mw.authorizeByIPAddress(),
    members.mw.loadAndAuthorize('moderator'),
  ];

  app.get('/:slug/admin/activities/list', preMw, (req, res) =>
    mw.list({ entityType: 'agenda', entityUid: req.agenda.uid })(req, res));
};

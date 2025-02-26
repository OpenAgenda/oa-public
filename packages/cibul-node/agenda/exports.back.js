import convertFormat from './ConvertFormat.js';
import loadCredentials from './loadCredentials.js';

export default (app) => {
  const { members, agendas: agendasSvc } = app.services;

  app.get(
    '/agendas/:uid/admin/events.json',
    agendasSvc.middleware.load({
      private: null,
      internal: true,
      namespaces: {
        identifiers: {
          uid: 'params.uid',
        },
      },
    }),
    members.mw.authorizeAdminModOrKey(),
    loadCredentials,
    convertFormat({
      sendJSON: true,
      admin: true,
      trackInfos: ['events', 'admin/export', 'json'],
    }),
  );
};

import * as agendaSvc from '../services/agenda/index.mjs';
import convertFormat from './ConvertFormat.mjs';
import loadCredentials from './loadCredentials.mjs';

const preMw = [agendaSvc.mw.load('uid')];

export default app => {
  const { members } = app.services;

  app.get(
    '/agendas/:uid/admin/events.json',
    preMw,
    members.mw.authorizeAdminModOrKey(),
    loadCredentials,
    convertFormat({
      sendJSON: true,
      admin: true,
      trackInfos: ['events', 'admin/export', 'json'],
    }),
  );
};

import * as agendaSvc from '../services/agenda/index.js';
import convertFormat from './ConvertFormat.js';
import loadCredentials from './loadCredentials.js';

const preMw = [agendaSvc.mw.load('uid')];

export default (app) => {
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

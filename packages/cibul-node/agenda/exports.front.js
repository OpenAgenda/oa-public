import cmn from '../lib/commons-app.js';
import legacySettings from '../lib/legacySettings.js';
import convertFormat from './ConvertFormat.js';
import loadCredentials from './loadCredentials.js';

const preMw = [cmn.loadLogger('agenda front')];

function removeCsp(req, res, next) {
  res.removeHeader('Content-Security-Policy');
  res.removeHeader('Content-Security-Policy-Report-Only');
  next();
}

export default (app) => {
  const { agendas: agendasSvc } = app.services;

  app.options('*/events.json*', (req, res) => res.sendStatus(200));

  app.get(
    '/agendas/:uid/events.json',
    preMw,
    async (req, res, next) => {
      if (!req.query.key) {
        setTimeout(next, 800);
        return;
      }

      try {
        const verified = await req.app.services.auth.verifyKey(req.query.key);
        if (!verified) {
          res.status(400).json({ error: 'Provided key is invalid' });
          return;
        }
        next();
      } catch (_err) {
        res.status(400).json({ error: 'Provided key is invalid' });
      }
    },
    loadCredentials,
    convertFormat({ sendJSON: true, trackInfos: ['events', 'export', 'json'] }),
  );

  app.get(
    '/agendas/:uid/settings.json',
    agendasSvc.middleware.load({
      internal: true,
      namespaces: {
        identifiers: {
          uid: 'params.uid',
        },
      },
    }),
    removeCsp,
    legacySettings.middleware,
  );
};

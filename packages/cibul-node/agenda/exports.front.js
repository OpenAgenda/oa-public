import cbify from '@openagenda/utils/cbify.js';
import cmn from '../lib/commons-app.js';
import legacySettingsMw from '../lib/legacySettingsMw.js';
import convertFormat from './ConvertFormat.js';
import loadCredentials from './loadCredentials.js';

const preMw = [cmn.loadLogger('agenda front')];

function removeCsp(req, res, next) {
  res.removeHeader('Content-Security-Policy');
  res.removeHeader('Content-Security-Policy-Report-Only');
  next();
}

function sleep(ms) {
  return (req, res, next) => {
    req.log.debug('sleeping for %s milliseconds', ms);

    setTimeout(() => {
      next();
    }, ms);
  };
}

function checkKey(onError) {
  return cbify(async (req, res, next) => {
    if (!req.query.key) {
      return sleep(800)(req, res, next);
    }

    const { keys: keysSvc } = req.app.services;

    try {
      const key = await keysSvc({ key: req.query.key }).get();

      if (!key) {
        return onError(req, res, next);
      }
    } catch (e) {
      return onError(req, res, next);
    }

    next();
  });
}

export default (app) => {
  const { agendas: agendasSvc } = app.services;

  app.options('*/events.json*', (req, res) => res.sendStatus(200));

  app.get(
    '/agendas/:uid/events.json',
    preMw,
    checkKey((req, res, _next) =>
      res.status(400).json({ error: 'Provided key is invalid' })),
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
    legacySettingsMw,
  );
};

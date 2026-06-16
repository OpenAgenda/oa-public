import _ from 'lodash';
import bodyParser from 'body-parser';
import express from 'express';
import serialize from 'serialize-javascript';
import { createElement } from 'react';
import ReactDOM from 'react-dom/server';
import { Spinner } from '@openagenda/react-shared';
import logs from '@openagenda/logs';
import manifest from '../client/dist/manifest.json' with { type: 'json' };

const log = logs('router');

const router = express.Router({ mergeParams: true });

function _getClientAppPath(serviceName, config) {
  const distFileName = manifest['main.js'];

  if (config.frontAppPath) {
    return `${config.frontAppPath}/${distFileName}`;
  }

  if (process.env.NODE_ENV === 'development') return '/js/app.js';

  return `${config.CDNPath}/${serviceName}/${distFileName}`;
}

async function _renderPage(req, res) {
  const init = {
    config: {
      lang: req.lang,
      base: req.baseUrl,
    },
    state: {},
  };

  const { cspNonce } = res.locals;

  const layoutData = {
    lang: req.lang,
    cspNonce,
  };

  res.type('html');
  res.end(
    router.layout(
      `<div>
      <div id="app">${ReactDOM.renderToString(createElement(Spinner))}</div>
      <script nonce="${cspNonce}" type="application/json" id="init">${serialize(init, { isJSON: true })}</script>
      <script nonce="${cspNonce}" defer type="text/javascript" src="${_getClientAppPath(router.service.name, router.service.config)}"></script>
    </div>`,
      layoutData,
    ),
  );
}

export default Object.assign(router, {
  dist: express.static(`${import.meta.dirname}/../client/dist`),
  setService: (service) => {
    router.service = service;
  },
  setLayout: (layout) => {
    router.layout = layout;
  },
});

router.get('/config.json', (req, res) => {
  router.service.getEventSchema().then((eventSchema) => {
    res.json({ eventSchema });
  });
});

router.post('*', bodyParser.json());
router.get('*', (req, res, next) =>
  (req.headers.accept !== 'application/json'
    ? _renderPage(req, res, next)
    : next()));

router.get('/', async (req, res, next) => {
  try {
    res.json(await router.service.listNetworks());
  } catch (e) {
    log('error', e);
    next(e);
  }
});

router.post('/', async (req, res, next) => {
  try {
    await router.service.createNetwork(req.body);
    res.send('ok');
  } catch (e) {
    next(e);
  }
});

router.get('/:uid', async (req, res, next) => {
  try {
    const uid = parseInt(req.params.uid, 10);

    res.json({
      network: await router.service.getNetwork(uid),
      schema: await router.service.getNetworkSchema(uid),
    });
  } catch (e) {
    next(e);
  }
});

router.post('/:uid', async (req, res, next) => {
  try {
    res.json(
      await router.service.setNetworkSchemaFields(
        req.params.uid,
        JSON.parse(req.body.data).fields,
      ),
    );
  } catch (e) {
    next(e);
  }
});

router.get('/:uid/agendas', async (req, res, next) => {
  const uid = parseInt(req.params.uid, 10);

  try {
    res.json({
      network: await router.service.getNetwork(uid),
      agendas: await router.service.getNetworkAgendas(uid),
      credentialsSchema: await router.service.getAgendaCredentialsSchema(),
    });
  } catch (e) {
    next(e);
  }
});

router.post('/:uid/agendas/add', async (req, res, next) => {
  try {
    res.json(
      await router.service.addAgendaToNetwork(
        parseInt(req.params.uid, 10),
        req.body.slugOrUrl.split('/').pop(),
        {
          credentials: req.body.credentials,
          official: req.body.official,
        },
      ),
    );
  } catch (e) {
    log('error', 'agenda add', e);
    next(e);
  }
});

router.post('/:uid/agendas/remove/:agendaUid', async (req, res, next) => {
  try {
    res.json(
      await router.service.removeAgendaFromNetwork(
        parseInt(req.params.uid, 10),
        parseInt(req.params.agendaUid, 10),
      ),
    );
  } catch (e) {
    log('error', 'agenda add', e);
    next(e);
  }
});

router.post('/:uid/agendas', async (req, res, next) => {
  try {
    res.json(
      await router.service.createAgenda(
        parseInt(req.params.uid, 10),
        req.body,
        await router.service.getLoggedUser(req),
      ),
    );
  } catch (e) {
    next(e);
  }
});

router.use((err, req, res, next) => {
  if (err.name === 'BadRequest') {
    res.status(400);
    // Validation errors carry `info.errors`; guard errors (e.g. "agenda is
    // already in a network") only have a message — surface it either way so the
    // 400 body is never empty.
    res.json(err.info ?? { message: err.message });
    return;
  }
  if (req.headers.accept === 'application/json') {
    res.status(500).json(_.pick(err, ['message']));
    return;
  }

  next(err);
});

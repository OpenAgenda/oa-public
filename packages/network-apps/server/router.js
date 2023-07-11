"use strict";

const _ = require('lodash');
const bodyParser = require('body-parser');
const express = require('express');
const serialize = require('serialize-javascript');
const { createElement } = require('react');
const ReactDOM = require('react-dom/server');
const { Spinner } = require('@openagenda/react-shared');
const log = require('@openagenda/logs')('router');

const router = express.Router({ mergeParams: true });

const manifest = require(__dirname + '/../client/dist/manifest.json');

module.exports = Object.assign(router, {
  dist: express.static(__dirname + '/../client/dist'),
  setService: service => router.service = service,
  setLayout: layout => router.layout = layout
});

router.get('/config.json', (req, res, next) => {
  router.service.getEventSchema().then(eventSchema => {
    res.json({ eventSchema });
  });
});

router.post('*', bodyParser.json());
router.get('*', (req, res, next) => req.headers.accept !== 'application/json' ? _renderPage(req, res, next) : next());

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

router.get('/networks/:uid', async (req, res, next) => {
  try {
    const uid = parseInt(req.params.uid);

    res.json({
      network: await router.service.getNetwork(uid),
      schema: await router.service.getNetworkSchema(uid)
    });
  } catch (e) {
    next(e);
  }
});

router.post(
  '/networks/:uid',
  async (req, res, next) => {
    try {
      await router.service.setNetworkSchemaFields(req.params.uid, JSON.parse(req.body.data).fields)
      res.send('ok');
    } catch (e) {
      next(e);
    }
  });

router.get(
  '/networks/:uid/agendas',
  async (req, res, next) => {
    const uid = parseInt(req.params.uid);

    try {
      res.json({
        network: await router.service.getNetwork(uid),
        agendas: await router.service.getNetworkAgendas(uid)
      });
    } catch (e) {
      next(e);
    }
  });

router.post(
  '/networks/:uid/agendas/add',
  async (req, res, next) => {
    try {
      res.json(await router.service.addAgendaToNetwork(
        parseInt(req.params.uid),
        req.body.slugOrUrl.split('/').pop()
      ));
    } catch (e) {
      log('error', 'agenda add', e);
      next(e);
    }
  });

router.post(
  '/networks/:uid/agendas/remove/:agendaUid',
  async (req, res, next) => {
    try {
      res.json(await router.service.removeAgendaFromNetwork(
        parseInt(req.params.uid),
        parseInt(req.params.agendaUid)
      ));
    } catch (e) {
      log('error', 'agenda add', e);
      next(e);
    }
  });

router.post(
  '/networks/:uid/agendas',
  async (req, res, next) => {
    try {
      res.json(await router.service.createAgenda(
        parseInt(req.params.uid),
        req.body,
        await router.service.getLoggedUser(req)
      ));
    } catch (e) {
      next(e);
    }
  });

router.use((err, req, res, next) => {
  if (req.headers.accept === 'application/json') {
    res.status(500).json(_.pick(err, ['message']));
  } else {
    next(err);
  }
});


async function _renderPage(req, res, next) {
  const init = {
    config: {
      lang: req.lang,
      base: req.baseUrl
    },
    state: {}
  };

  const layoutData = { lang: req.lang };

  res.end(router.layout(
    `<div>
      <div id="app">${ReactDOM.renderToString(
        createElement(Spinner)
      )}</div>
      <script type="application/json" id="init">${serialize(init, { isJSON: true })}</script>
      <script defer type="text/javascript" src="${_getClientAppPath(router.service.name, router.service.config)}"></script>
    </div>`, layoutData));
}

function _getClientAppPath(serviceName, config) {
  const distFileName = manifest['main.js'];

  if (config.frontAppPath) {
    return config.frontAppPath + '/' + distFileName;
  }

  if (process.env.NODE_ENV === 'development') return '/js/app.js';

  return [
    config.CDNPath + serviceName,
    distFileName
  ].join('/');
}

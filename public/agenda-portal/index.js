// /* eslint-disable */

// if (process.env.NODE_ENV === 'development') {
//   // eslint-disable-next-line global-require
//   require('source-map-support').install({ hookRequire: true });
// }

import { promisify } from 'node:util';
import path from 'node:path';
import _ from 'lodash';
import express from 'express';
import Hbs from 'hbs';
import qs from 'qs';
import logs from './lib/Log.js';
import Proxy from './lib/Proxy.js';
import launch from './lib/launch.js';
import loadResLocals from './lib/loadResLocals.js';
import * as utils from './utils/index.js';
import { register as registerHelpers } from './lib/helpers/index.js';
import EventTransforms from './lib/events/Transforms.js';
import index from './middleware/renderIndex.js';
import error from './middleware/error.js';
import * as eventMiddlewares from './middleware/event.js';
import {
  redirectToNeighbor,
  navigationLinks,
} from './middleware/eventNavigation.js';
import list from './middleware/listEvents.js';
import randomFromSet from './middleware/randomFromSet.js';
import pageGlobals from './middleware/pageGlobals.js';
import renderSelection from './middleware/renderSelection.js';
import redirectLegacyEventQuery from './middleware/redirectLegacyEventQuery.js';
import renderList from './middleware/renderList.js';
import redirect from './middleware/redirectToEvent.js';
import showPage from './middleware/showPage.js';
import watchViews from './dev/watchViews.js';
import webpackProxy from './dev/webpackProxy.js';

const log = logs('index');

const mw = {
  index,
  error,
  event: eventMiddlewares,
  redirectToNeighbor,
  list,
  randomFromSet,
  preview: renderSelection('preview'),
  pageGlobals,
  redirectLegacyEventQuery,
  renderList,
  redirect,
  share: renderSelection('share'),
  showPage,
  navigationLinks,
};

const baseAssetsPath = `${import.meta.dirname}/assets`;

const { I18N } = utils;

let devApp = null; // used for @openagenda/agenda-portal dev only

export default async function Portal(options) {
  log('booting');

  const app = devApp || express();
  const hbs = Hbs.create();

  const config = {
    eventsPerPage: 20,
    assetsRoot: null,
    devServerPort: 3001,
    longDescriptionFormat: 'HTMLWithEmbeds',
    ...options,
  };

  const {
    dir,
    // eventHook,
    // lang, // main language of portal
    uid, // uid of agenda
    key: apiKey, // public key of OA account
    views, // path to views folder
    assets, // optional path to assets folder
    i18n, // optional path to multilingual labels folder
    // sass, // optional path to sass file
    defaultTimezone, // optional: used for converting oaq date filter (YYYY-MM-DD) to v2 format (timezoned)
    eventsPerPage, // optional number of events to load per page
    preFilter,
    defaultFilter, // optional: filter that applies when no other filter is set
    visibilityPastEvents,
    // cache,
    proxy: injectedProxy,
    assetsRoot,
    proxyHookBeforeGet,
    devServerPort,
    longDescriptionFormat,
  } = config;

  const middlewareHooks = {
    all: {
      pre: config.middlewareHooks?.all?.pre ?? ((req, res, next) => next()),
    },
    list: {
      preRender: (req, res, next) => next(),
      ..._.get(config, 'middlewareHooks.list', {}),
    },
    show: {
      preRender: (req, res, next) => next(),
      ..._.get(config, 'middlewareHooks.show', {}),
    },
    preview: {
      preRender: (req, res, next) => next(),
      ..._.get(config, 'middlewareHooks.preview', {}),
    },
    share: {
      preRender: (req, res, next) => next(),
      ..._.get(config, 'middlewareHooks.share', {}),
    },
  };

  Object.assign(app.locals, config);

  app.set('query parser', (str) =>
    qs.parse(str, { allowPrototypes: true, arrayLimit: Infinity }));
  app.set('view engine', 'hbs');
  app.set('views', path.join(dir, views));
  app.engine('hbs', hbs.__express);

  const partialsDir = path.join(dir, views, 'partials');

  await promisify(hbs.registerPartials).call(hbs, partialsDir);

  app.locals.defaultLang = config.lang || 'en';

  registerHelpers(hbs);

  const { intlByLocale, handlebarsHelper: i18nHelper } = await I18N(
    path.join(dir, i18n),
  );

  app.intlByLocale = intlByLocale;

  if (i18n) {
    hbs.registerHelper('i18n', i18nHelper);
  }

  const proxy = injectedProxy
    || Proxy({
      key: apiKey,
      defaultLimit: eventsPerPage,
      preFilter,
      defaultFilter,
      visibilityPastEvents,
      defaultTimezone,
      proxyHookBeforeGet,
      longDescriptionFormat,
      app,
    });

  app.set('proxy', proxy);

  app.set('transforms', {
    event: _.pick(EventTransforms(app.locals), ['listItem', 'show']),
  });

  // routes

  if (uid) {
    app.locals.assetsRoot = app.locals.root;
    try {
      app.locals.agenda = await app.get('proxy').head(uid);
    } catch (e) {
      if (e.message === 'Unauthorized') {
        log(
          '\n\nEXITING: account linked to key must be a member of the agenda\n\n',
        );
      }
      return process.exit();
    }
    app.use(express.static(baseAssetsPath));
  } else if (!assetsRoot) {
    throw new Error(
      'When portal is not agenda-specific, assets path needs to be explicited at init under "assetsRoot" key',
    );
  }

  async function extractFiltersAndWidgets() {
    app.locals.filters = [];
    app.locals.widgets = [];

    // populate filters and widgets
    await promisify(app.render).call(app, 'index', {
      __extractFiltersAndWidgets: true,
    });
  }

  await extractFiltersAndWidgets();

  if (process.env.NODE_ENV === 'development') {
    watchViews(hbs, partialsDir, extractFiltersAndWidgets);
  }

  if (process.env.NODE_ENV === 'development') {
    webpackProxy(app, devServerPort);
  }

  if (assets) {
    app.use(express.static(path.join(dir, assets)));
  }

  app.use(loadResLocals);

  app.use(middlewareHooks.all.pre);

  app.get(
    '/',
    mw.redirectLegacyEventQuery,
    mw.pageGlobals,
    mw.list(true),
    middlewareHooks.list.preRender,
    mw.index,
  );
  app.get(
    '/p/:page',
    mw.pageGlobals,
    mw.list(true),
    middlewareHooks.list.preRender,
    mw.index,
  );
  app.get(
    '/preview',
    mw.pageGlobals.withOptions({ mainScript: 'preview.js', iframable: true }),
    mw.list(),
    mw.randomFromSet,
    middlewareHooks.preview.preRender,
    mw.preview,
  );
  app.get(
    '/share',
    mw.pageGlobals.withOptions({ mainScript: 'share.js', iframable: true }),
    mw.list(),
    middlewareHooks.share.preRender,
    mw.share,
  );

  app.get(
    '/events/p/:page',
    mw.list(true),
    middlewareHooks.list.preRender,
    mw.renderList,
  );
  app.get(
    '/events',
    mw.list(true),
    middlewareHooks.list.preRender,
    mw.renderList,
  );

  app.get('/events/nav/:direction', mw.redirectToNeighbor);

  app.get(
    ['/events/:slug', '/events/:slug/t/:timing'],
    mw.pageGlobals,
    mw.navigationLinks,
    mw.event.get,
    middlewareHooks.show.preRender,
    mw.event.render,
  );

  app.get('/permalinks/events/:uid', mw.redirect);

  app.get('/:page', mw.pageGlobals, mw.showPage);

  app.use(mw.pageGlobals, (req, res) =>
    res.status(404).render('404', req.data));

  app.use(mw.error);

  app.launch = launch.bind(null, app);

  return {
    app,
    baseAssetsPath,
  };
}

export function loadDevApp(dev) {
  devApp = dev;
}

Portal.loadDevApp = loadDevApp;

export { utils };

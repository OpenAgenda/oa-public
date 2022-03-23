/* eslint-disable */

'use strict';

if (process.env.NODE_ENV === 'development') {
  // eslint-disable-next-line global-require
  require('source-map-support').install({ hookRequire: true });
}

const { promisify } = require('util');
const path = require('path');
const _ = require('lodash');
const express = require('express');
const Hbs = require('hbs');
const qs = require('qs');

const log = require('./lib/Log')('index');

const Proxy = require('./lib/Proxy');
const launch = require('./lib/launch');
const loadResLocals = require('./lib/loadResLocals');
const tasks = require('./tasks');
const utils = require('./utils');
const { register: registerHelpers } = require('./lib/helpers');

const EventTransforms = require('./lib/events/Transforms');

const index = require('./middleware/renderIndex');
const error = require('./middleware/error');
const eventMiddlewares = require('./middleware/event');
const { redirectToNeighbor } = require('./middleware/eventNavigation');
const list = require('./middleware/listEvents');
const randomFromSet = require('./middleware/randomFromSet');
const pageGlobals = require('./middleware/pageGlobals');
const renderSelection = require('./middleware/renderSelection');
const redirectLegacyEventQuery = require('./middleware/redirectLegacyEventQuery');
const renderList = require('./middleware/renderList');
const redirect = require('./middleware/redirectToEvent');
const showPage = require('./middleware/showPage');
const { navigationLinks } = require('./middleware/eventNavigation');

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

const baseAssetsPath = `${__dirname}/assets`;

const { I18N } = utils;

let devApp = null; // used for @openagenda/agenda-portal dev only

module.exports = async options => {
  log('booting');

  const app = devApp || express();
  const hbs = Hbs.create();

  const config = {
    eventsPerPage: 20,
    assetsRoot: null,
    devServerPort: 3001,
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
    // cache,
    proxy: injectedProxy,
    assetsRoot,
    proxyHookBeforeGet,
    devServerPort
  } = config;

  const middlewareHooks = {
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

  app.set('query parser', str => qs.parse(str, { allowPrototypes: true, arrayLimit: Infinity }));
  app.set('view engine', 'hbs');
  app.set('views', path.join(dir, views));
  app.engine('hbs', hbs.__express);

  const partialsDir = path.join(dir, views, 'partials');

  await promisify(hbs.registerPartials).call(hbs, partialsDir);

  app.locals.defaultLang = config.lang || 'en';

  registerHelpers(hbs);

  const {
    intlByLocale,
    handlebarsHelper: i18nHelper
  } = I18N(path.join(dir, i18n));

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
      defaultTimezone,
      proxyHookBeforeGet,
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
          '\n\nEXITING: account linked to key must be a member of the agenda\n\n'
        );
      }
      return process.exit();
    }
    app.use(express.static(baseAssetsPath));
  } else if (!assetsRoot) {
    throw new Error(
      'When portal is not agenda-specific, assets path needs to be explicited at init under "assetsRoot" key'
    );
  }

  async function extractFiltersAndWidgets() {
    app.locals.filters = [];
    app.locals.widgets = [];

    // populate filters and widgets
    await promisify(app.render).call(app, 'index', { __extractFiltersAndWidgets: true });
  }

  await extractFiltersAndWidgets();

  if (process.env.NODE_ENV === 'development') {
    require('./dev/watchViews')(hbs, partialsDir, extractFiltersAndWidgets);
  }

  if (process.env.NODE_ENV === 'development') {
    require('./dev/webpackProxy')(app, devServerPort);
  }

  if (assets) {
    app.use(express.static(path.join(dir, assets)));
  }

  app.use(loadResLocals);

  app.get(
    '/',
    mw.redirectLegacyEventQuery,
    mw.pageGlobals,
    mw.list(true),
    middlewareHooks.list.preRender,
    mw.index
  );
  app.get(
    '/p/:page',
    mw.pageGlobals,
    mw.list(true),
    middlewareHooks.list.preRender,
    mw.index
  );
  app.get(
    '/preview',
    mw.pageGlobals.withOptions({ mainScript: 'preview.js', iframable: true }),
    mw.list(),
    mw.randomFromSet,
    middlewareHooks.preview.preRender,
    mw.preview
  );
  app.get(
    '/share',
    mw.pageGlobals.withOptions({ mainScript: 'share.js', iframable: true }),
    mw.list(),
    middlewareHooks.share.preRender,
    mw.share
  );

  app.get(
    '/events/p/:page',
    mw.list(true),
    middlewareHooks.list.preRender,
    mw.renderList
  );
  app.get('/events', mw.list(true), middlewareHooks.list.preRender, mw.renderList);

  app.get('/events/nav/:direction', mw.redirectToNeighbor);

  app.get(
    ['/events/:slug', '/events/:slug/t/:timing'],
    mw.pageGlobals,
    mw.navigationLinks,
    mw.event.get,
    middlewareHooks.show.preRender,
    mw.event.render
  );

  app.get('/permalinks/events/:uid', mw.redirect);

  app.get('/:page', mw.pageGlobals, mw.showPage);

  app.use(mw.pageGlobals, (req, res) => res.status(404).render('404', req.data));

  app.use(mw.error);

  app.launch = launch.bind(null, app);

  tasks({ config, app });

  return {
    app,
    baseAssetsPath,
  };
};

module.exports.loadDevApp = dev => {
  devApp = dev;
};

module.exports.utils = utils;

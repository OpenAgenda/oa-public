'use strict';

const _ = require('lodash');
const express = require('express');
const hbs = require('hbs');

const log = require('./lib/Log')('index');

const Proxy = require('./lib/Proxy');
const launch = require('./lib/launch');
const loadResLocals = require('./lib/loadResLocals');
const tasks = require('./tasks');
const utils = require('./utils');

const EventTransforms = require('./lib/events/Transforms');

const index = require('./middleware/renderIndex');
const error = require('./middleware/error');
const get = require('./middleware/getEvent');
const { redirectToNeighbor } = require('./middleware/eventNavigation');
const list = require('./middleware/listEvents');
const pageGlobals = require('./middleware/pageGlobals');
const renderSelection = require('./middleware/renderSelection');
const webpackSASSMiddleware = require('./dev/webpackSASSMiddleware');
const redirectLegacyEventQuery = require('./middleware/redirectLegacyEventQuery');
const renderList = require('./middleware/renderList');
const redirect = require('./middleware/redirectToEvent');
const showPage = require('./middleware/showPage');
const { navigationLinks } = require('./middleware/eventNavigation');

const mw = {
  index,
  error,
  get,
  redirectToNeighbor,
  list,
  preview: renderSelection('preview'),
  pageGlobals,
  redirectLegacyEventQuery,
  renderList,
  redirect,
  share: renderSelection('share'),
  showPage,
  navigationLinks
};

const baseAssetsPath = `${__dirname}/assets`;

let devApp = null; // used for @openagenda/agenda-portal dev only

module.exports = async options => {
  log('booting');

  const app = devApp || express();

  const config = _.assign(
    {
      eventsPerPage: 20,
      assetsRoot: null,
      jsonExportVersion: 1,
      defaultTimezone: 'Europe/Paris'
    },
    options
  );

  const {
    // eventHook,
    // lang, // main language of portal
    uid, // uid of agenda
    key, // public key of OA account
    views, // path to views folder
    assets, // optional path to assets folder
    // sass, // optional path to sass file
    defaultTimezone, // optional: used for converting oaq date filter (YYYY-MM-DD) to v2 format (timezoned)
    eventsPerPage, // optional number of events to load per page
    defaultFilter, // optional: filter that applies when no other filter is set
    // cache,
    proxy,
    jsonExportVersion,
    assetsRoot
  } = config;

  app.set('view engine', 'hbs');
  app.set('views', views);
  app.engine('hbs', hbs.__express);
  hbs.registerPartials(`${views}/partials`);

  _.assign(app.locals, config);

  app.set(
    'proxy',
    proxy
      || Proxy({
        jsonExportVersion,
        key,
        defaultLimit: eventsPerPage,
        defaultFilter,
        defaultTimezone
      })
  );

  app.set('transforms', {
    event: _.pick(EventTransforms(app.locals), ['listItem', 'show'])
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
        return process.exit();
      }
      throw e;
    }
    app.use(express.static(baseAssetsPath));
  } else if (!assetsRoot) {
    throw new Error(
      'When portal is not agenda-specific, assets path needs to be explicited at init under "assetsRoot" key'
    );
  }

  if (process.env.NODE_ENV === 'development') {
    app.use(webpackSASSMiddleware(app.locals.sass));
  }

  if (assets) {
    app.use(express.static(assets));
  }

  app.use(loadResLocals);

  app.get('/', mw.redirectLegacyEventQuery, mw.pageGlobals, mw.list, mw.index);
  app.get('/p/:page', mw.pageGlobals, mw.list, mw.index);
  app.get(
    '/preview',
    mw.pageGlobals.withOptions({ mainScript: 'preview.js' }),
    mw.list,
    mw.preview
  );
  app.get(
    '/share',
    mw.pageGlobals.withOptions({ mainScript: 'share.js' }),
    mw.list,
    mw.share
  );

  app.get('/events/p/:page', mw.list, mw.renderList);
  app.get('/events', mw.list, mw.renderList);

  app.get('/events/nav/:direction', mw.redirectToNeighbor);

  app.get(
    ['/events/:slug', '/events/:slug/t/:timing'],
    mw.pageGlobals,
    mw.navigationLinks,
    mw.get
  );

  app.get('/permalinks/events/:uid', mw.redirect);

  app.get('/:page', mw.pageGlobals, mw.showPage);

  app.use(mw.pageGlobals, (req, res) => res.status(404).render('404', req.data));

  app.use(mw.error);

  app.launch = launch.bind(null, app);

  tasks({ config, proxy });

  return {
    app,
    baseAssetsPath
  };
};

module.exports.loadDevApp = dev => {
  devApp = dev;
};

module.exports.utils = utils;

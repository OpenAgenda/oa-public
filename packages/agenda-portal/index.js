'use strict';

const _ = require('lodash');
const express = require('express');
const hbs = require('hbs');

const log = require('./lib/Log')('index');

const Proxy = require('./lib/Proxy');
const launch = require('./lib/launch');
const loadResLocals = require('./lib/loadResLocals');
const tasks = require('./tasks');

const EventTransforms = require('./lib/events/Transforms');

const index = require('./middleware/renderIndex');
const error = require('./middleware/error');
const get = require('./middleware/getEvent');
const { redirectToNeighbor } = require('./middleware/eventNavigation');
const list = require('./middleware/listEvents');
const pageGlobals = require('./middleware/pageGlobals');
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
  pageGlobals,
  redirectLegacyEventQuery,
  renderList,
  redirect,
  showPage,
  navigationLinks
};

const baseAssetsPath = `${__dirname}/assets`;

module.exports = async options => {
  log('booting');

  const app = express();

  const config = _.assign(
    {
      eventsPerPage: 20,
      assetsRoot: null
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
    eventsPerPage, // optional number of events to load per page
    defaultFilter, // optional: filter that applies when no other filter is set
    // cache,
    proxy,
    assetsRoot
  } = config;

  app.set('view engine', 'hbs');
  app.set('views', views);
  hbs.registerPartials(`${views}/partials`);

  _.assign(app.locals, config);

  app.set(
    'proxy',
    proxy
      || Proxy({
        key,
        defaultLimit: eventsPerPage,
        defaultFilter
      })
  );

  app.set('transforms', {
    event: _.pick(EventTransforms(app.locals), ['listItem', 'show'])
  });

  // routes

  if (uid) {
    app.locals.assetsRoot = app.locals.root;
    app.locals.agenda = await app.get('proxy').head(uid);
    app.use(express.static(baseAssetsPath));
  } else if (!assetsRoot) {
    throw new Error(
      'When portal is not agenda-specific, assets path needs to be explicited at init under "assetsRoot" key'
    );
  }

  if (process.env.NODE_ENV === 'development') {
    launch.applyDevelopmentMiddleware(app);
  }

  if (assets) {
    app.use(express.static(assets));
  }

  app.use(loadResLocals);

  app.get('/', mw.redirectLegacyEventQuery, mw.pageGlobals, mw.list, mw.index);
  app.get('/p/:page', mw.pageGlobals, mw.list, mw.index);

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

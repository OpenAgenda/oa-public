/* eslint-disable */

require = require('esm')(module /* , options */);

'use strict';

if (process.env.NODE_ENV === 'development') {
  // eslint-disable-next-line global-require
  require('source-map-support').install({ hookRequire: true });
}

const { promisify } = require('util');
const _ = require('lodash');
const express = require('express');
const Hbs = require('hbs');
const qs = require('qs');
const cn = require('classnames');
const marked = require('marked');

const log = require('./lib/Log')('index');

const Proxy = require('./lib/Proxy');
const launch = require('./lib/launch');
const loadResLocals = require('./lib/loadResLocals');
const tasks = require('./tasks');
const utils = require('./utils');

const EventTransforms = require('./lib/events/Transforms');

const index = require('./middleware/renderIndex');
const error = require('./middleware/error');
const eventMiddlewares = require('./middleware/event');
const { redirectToNeighbor } = require('./middleware/eventNavigation');
const list = require('./middleware/listEvents');
const randomFromSet = require('./middleware/randomFromSet');
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

function getFieldSchema(agendaSchema, fieldName) {
  return agendaSchema.fields.find(v => v.field === fieldName);
}

module.exports = async options => {
  log('booting');

  const app = devApp || express();
  const hbs = Hbs.create();

  const config = {
    eventsPerPage: 20,
    assetsRoot: null,
    ...options,
  };

  const {
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
  app.set('views', views);
  app.engine('hbs', hbs.__express);
  await promisify(hbs.registerPartials).call(hbs, `${views}/partials`);

  app.locals.defaultLang = config.lang || 'en';

  hbs.registerHelper({
    mdToHtml: md => marked(md, { breaks: true }),
    json: JSON.stringify,
    object: ({ hash = {} } = {}) => hash,
    array: (...arr) => arr.slice(0, -1),
    concat: (...strings) => strings.slice(0, -1).join(''),
    fieldSchema: (fieldName, { data }) => getFieldSchema(data.root.agenda.schema, fieldName),
    image: (image, type) => {
      if (!image) {
        return '';
      }

      const variant = typeof type === 'string'
        ? image.variants?.find(img => img.type === type) ?? image
        : image;

      return `${image.base}${variant.filename}`;
    },
    filter({ hash, data }) {
      const {
        id,
        tagName = 'div',
        className = '',
        fieldName,
        name = fieldName,
        ...restOptions
      } = hash;

      const attrs = {
        ...restOptions,
        name,
        destSelector: id ? `[data-oa-filter-id="${id}"]` : `[data-oa-filter="${name}"]`
      };

      if (fieldName) {
        attrs.fieldSchema = getFieldSchema(data.root.agenda.schema, fieldName);
      }

      if (data.root.__extractFiltersAndWidgets) {
        data.root.filters.push(attrs);
      }

      return new hbs.SafeString(`
        <${tagName}
          class="${className}"
          data-oa-filter="${name}"
          ${id ? `data-oa-filter-id="${hbs.Utils.escapeExpression(id)}"` : ''}
          data-oa-filter-params="${hbs.Utils.escapeExpression(JSON.stringify(attrs))}"
        ></${tagName}>
      `);
    },
    customFilter({ fn, hash, data }) {
      const {
        id,
        tagName = 'div',
        className = '',
        query = {},
        activeClass = 'active',
        inactiveClass = 'inactive',
        ...restOptions
      } = hash;

      const attrs = {
        aggregation: null,
        type: 'custom',
        query,
        activeClass,
        inactiveClass,
        ...restOptions
      };

      const statusClass = _.isMatch(_.omitBy(data.root.query, _.isEmpty), _.omitBy(query, _.isEmpty))
        ? activeClass
        : inactiveClass;

      if (data.root.__extractFiltersAndWidgets) {
        data.root.filters.push(attrs);
      }

      return new hbs.SafeString(`
        <${tagName}
          class="${cn(className, statusClass)}"
          data-oa-filter
          ${id ? `data-oa-filter-id="${hbs.Utils.escapeExpression(id)}"` : ''}
          data-oa-filter-params="${hbs.Utils.escapeExpression(JSON.stringify(attrs))}"
        >
          ${fn(this)}
        </${tagName}>
      `);
    },
    widget({ hash, data }) {
      const {
        tagName = 'div',
        className = '',
        name
      } = hash;


      if (data.root.__extractFiltersAndWidgets) {
        data.root.widgets[name] = `[data-oa-widget="${name}"]`;
      }

      return new hbs.SafeString(`
        <${tagName}
          ${className ? `class="${className}"` : ''}
          data-oa-widget="${name}"
        ></${tagName}>
      `);
    }
  });

  const {
    intlByLocale,
    handlebarsHelper: i18nHelper
  } = I18N(i18n);

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


  app.locals.filters = [];
  app.locals.widgets = {};

  // populate filters and widgets
  await promisify(app.render).call(app, 'index', { __extractFiltersAndWidgets: true });

  if (process.env.NODE_ENV === 'development') {
    app.use(webpackSASSMiddleware(app.locals.sass));
  }

  if (assets) {
    app.use(express.static(assets));
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
    mw.list(),
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
    mw.list(),
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

  tasks({ config, proxy });

  return {
    app,
    baseAssetsPath,
  };
};

module.exports.loadDevApp = dev => {
  devApp = dev;
};

module.exports.utils = utils;

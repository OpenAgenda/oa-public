'use strict';

const path = require('path');
const _ = require('lodash');
const express = require('express');
const httpProxy = require('http-proxy');
const matchMw = require('@openagenda/react-integration-app/middleware');
const config = require('../config');
const cmn = require('../lib/commons-app');

const apiRoot = `http://localhost:${config.port}`;
const phpPrefix = process.env.NODE_ENV === 'development' ? '/frontend_dev.php' : '';
const devServerPort = process.env.DEV_SERVER_PORT || null;
const proxy = process.env.DEV_SERVER_PORT ? httpProxy.createProxyServer({ secure: false })
  .on('error', (error, req, res) => {
    if (error.code !== 'ECONNRESET') {
      console.error('proxy error', error);
    }
    if (!res.headersSent) {
      res.writeHead(500, { 'content-type': 'application/json' });
    }

    const json = {
      error: 'proxy_error',
      reason: error.message
    };
    res.end(JSON.stringify(json));
  }) : null;

const initialState = req => ({
  home: {
    settings: {
      prefix: '/home', // for links
      rootPrefix: '/home(|/events)', // because of /home/activities
      apiRoot,
      lang: req.lang,
      perPageLimit: 20,
      isNew: _.get(req, 'user.isNew'),
      displayLegacyMessageTab: false,
      userId: _.get(req, 'user.id'),
      userUid: _.get(req, 'user.uid')
    },
    res: {
      agendas: {
        contribute: '/:slug/contribute',
        create: '/new',
        list: '/home/agendas',
        show: '/:slug',
        showPrivate: '/:slug.prv',
        addEvent: `${phpPrefix}/:slug/addevent`,
        moderate: `${phpPrefix}/:slug/admin`,
        contact: '/:slug/contact'
      },
      events: {
        list: '/home/events.json',
        show: '/:slug/events/:eventSlug',
        showPrivate: '/:slug.prv/events/:eventSlug',
        showWithoutAgenda: '/events/:eventSlug',
        edit: '/:slug/event/:eventSlug/edit'
      },
      messages: '/home/messages',
      notifs: '/home/notifications',
      search: '/agendas'
    }
  },
  userSettings: {
    settings: {
      prefix: '/settings',
      apiRoot,
      lang: req.lang
    },
    res: {
      getMe: '/users/me',
      updateProfile: '/users/me',
      deleteAccount: '/users/me',
      changeEmail: '/users/me/requestChangeEmail',
      changePassword: '/users/me/changePassword',
      generateApiKey: '/users/me/generateApiKey',
      uploadProfileImage: '/users/me/setImageProfile',
      removeProfileImage: '/users/me/clearImageProfile'
    }
  },
  agendaSettingsNew: {
    settings: {
      prefix: '/new',
      apiRoot,
      lang: req.lang
    },
    res: {
      create: '/new',
      slugAvailable: '/agendas/slugs/available',
      onCreated: '/:slug/admin/getting-started'
    }
  },
  userActivities: {
    settings: {
      prefix: '/home/activities',
      apiRoot,
      lang: req.lang,
      perPageLimit: 20
    },
    res: {
      list: '/home/activities/list'
    }
  },
  aggregatorSources: {
    settings: {
      prefix: `/:slug/admin/sources`,
      lang: req.lang,
      apiRoot: `http://localhost:${config.port}`,
      perPageLimit: 20
    },
    res: {
      list: '/:slug/admin/sources',
      add: '/:slug/admin/sources',
      update: '/:slug/admin/sources/:sourceId',
      remove: '/:slug/admin/sources/:sourceId',
      showAgenda: '/:slug',
      createAggregator: `${phpPrefix}/agenda/:uid/aggregator/create`,
      agendaSearch: '/agendas.json',
      getAgenda: '/agendas.json'
    }
  }
});

module.exports = app => {
  if (proxy) {
    app.use(
      '/dist/react-integration-app',
      (req, res) => proxy.web(req, res, { target: `https://localhost:${devServerPort}/dist/react-integration-app/` })
    );
  }

  app.use(
    '/dist/react-integration-app',
    express.static(path.join(
      path.dirname(require.resolve('@openagenda/react-integration-app/package.json')),
      'dist'
    )),
    (req, res) => res.sendStatus(404) // if not, unhandled files will be handled by following routes
  );

  app.get(
    [
      //home
      '/home',
      '/home/events',
      '/home/activities',
      // user-apps
      '/settings/?*?',
      // agenda-settings
      '/new',
      // aggregator-sources
      '/:slug/admin/sources',
      '/:slug/admin/sources/?*?'
    ],
    cmn.loadLogger('webapp'),
    cmn.loadBaseData('oasfmain.css'),
    (req, res, next) => matchMw({
      initialState,
      apiRoot,
      lang: req.lang,
      // publicPath: devServerPort ? `//localhost:${devServerPort}/dist/react-integration-app` : undefined
    })(req, res, next)
  );
};

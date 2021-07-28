'use strict';

const path = require('path');
const express = require('express');
const httpProxy = require('http-proxy');
const { matchesUA } = require('browserslist-useragent');
const matchMw = require('@openagenda/react-integration-app/middleware');
const inboxLabels = require('@openagenda/labels/inboxes');
const makeLabelGetter = require('@openagenda/labels');
const config = require('../config');
const cmn = require('../lib/commons-app');

const getInboxLabel = makeLabelGetter(inboxLabels);

const apiRoot = `http://localhost:${config.port}`;

// const devServerHost = process.env.DEV_SERVER_HOST || 'localhost';
const devServerPort = parseInt(process.env.DEV_SERVER_PORT, 10) || null;
const proxy = devServerPort ? httpProxy.createProxyServer({ secure: false })
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

function outdatedBrowserMw(req, res, next) {
  const userAgent = req.headers['user-agent'];

  if (!userAgent) {
    return next();
  }

  const outdatedBrowser = !matchesUA(userAgent, {
    ignoreMinor: true,
    ignorePatch: true,
    allowHigherVersions: true
  });

  if (outdatedBrowser) {
    req.outdatedBrowser = true;
  }

  next();
}

const initialState = async req => {
  const { services } = req.app;

  const user = req.user && req.user.uid ? await services.users.get(req.user.uid, {
    user: req.user,
    includeImagePath: true
  }) : null;

  const isTranslator = user ? config.translators.includes(user.uid) : false;
  const translateMode = req.cookies.translateMode === 'true';
  const lang = isTranslator && translateMode ? 'io' : req.lang;

  return {
    layout: {
      main: {
        apiRoot,
        lang,
        user,
        userLoaded: true,
        userLoading: false,
        isTranslator,
        translateMode,
        outdatedBrowser: req.outdatedBrowser
      },
      res: {
        main: {
          getUser: '/users/me',
          checkInboxNews: '/latest-inbox-timestamp'
        },
        agendaAdmin: {
          loadAgenda: '/:slug/admin/layout',
          verifyLocationCount: '/agendas/:uid/admin/locations/unverified'
        }
      }
    },

    home: {
      settings: {
        prefix: '/home', // for links
        rootPrefix: '/home(|/events)', // because of /home/activities
        apiRoot,
        perPageLimit: 20,
        displayLegacyMessageTab: false
      },
      res: {
        agendas: {
          contribute: '/:slug/contribute',
          create: '/new',
          list: '/home/agendas',
          show: '/:slug',
          showPrivate: '/:slug.prv',
          addEvent: '/:slug/contribute',
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
        apiRoot
      },
      res: {
        getMe: '/users/me',
        updateProfile: '/users/me',
        deleteAccount: '/users/me',
        changeEmail: '/users/me/requestChangeEmail',
        changePassword: '/users/me/changePassword',
        generateApiKey: '/users/me/generateApiKey'
      }
    },
    agendaSettingsNew: {
      settings: {
        prefix: '/new',
        apiRoot,
        lang
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
        lang,
        perPageLimit: 20
      },
      res: {
        list: '/home/activities/list'
      }
    },
    aggregatorSources: {
      settings: {
        prefix: '/:slug/admin/sources',
        apiRoot: `http://localhost:${config.port}`,
        perPageLimit: 20
      },
      res: {
        list: '/:slug/admin/sources',
        add: '/:slug/admin/sources',
        update: '/:slug/admin/sources/:sourceId',
        remove: '/:slug/admin/sources/:sourceId',
        showAgenda: '/:slug',
        agendaSearch: '/agendas.json',
        getAgenda: '/:slug',
        getAggregator: '/:slug/admin/aggregator',
        setAggregator: '/:slug/admin/aggregator'
      }
    },
    agendaSettingsEdit: {
      settings: {
        prefix: '/:slug/admin',
        lang,
        apiRoot: `http://localhost:${config.port}`
      },
      res: {
        agenda: '/:slug',
        addEvent: '/:slug/contribute',
        createEmbed: '/:slug/admin/webembed',
        slugAvailable: '/agendas/slugs/available',
        set: '/:slug/admin/settings/edit',
        remove: '/:slug/admin/settings/remove',
        keys: {
          create: '/:slug/admin/settings/keys/create',
          list: '/:slug/admin/settings/keys/list',
          update: '/:slug/admin/settings/keys/update',
          remove: '/:slug/admin/settings/keys/remove'
        }
      }
    },
    inboxUser: {
      settings: {
        context: 'user',
        prefix: '/home/inbox',
        lang,
        apiRoot: `http://localhost:${config.port}`,
        perPageLimit: 20,
        emptyInboxLabel: 'homeInboxDesc',
        displayHelp: true,
        autoFocus: true
      },
      res: {
        refreshCheck: '/home/inbox/refresh-check',
        author: '/home/inbox/author.json',
        conversations: {
          create: '/home/inbox/conversations.json',
          list: '/home/inbox/conversations.json',
          action: '/home/inbox/conversations/:conversationId/action/:code.json',
          resume: '/home/inbox/conversations/:conversationId/resume.json'
        },
        messages: {
          list: '/home/inbox/conversations/:conversationId/messages.json',
          create: '/home/inbox/conversations/:conversationId/messages.json',
          prepareAttachment: '/home/inbox/conversations/:conversationId/prepare-attachment',
          addAttachment: '/home/inbox/conversations/:conversationId/add-attachment'
        }
      }
    },
    support: {
      settings: {
        context: 'user',
        prefix: '/support',
        lang,
        apiRoot: `http://localhost:${config.port}`,
        perPageLimit: 20,
        creationDesc: getInboxLabel('supportInboxDesc', lang),
        // displayHelp: true,
        hideEmptyList: true, // redirect on creation if the list is empty
        allowCreateConversation: true, // show creation button
        topListForm: true,
        defaultQuery: {
          type: 'support',
          destinationInbox: {
            type: 'support',
            identifier: 1
          }
        }
      },
      res: {
        author: '/home/inbox/author.json',
        conversations: {
          create: '/home/inbox/conversations.json',
          list: '/home/inbox/conversations.json',
          action: '/home/inbox/conversations/:conversationId/action/:code.json',
          resume: '/home/inbox/conversations/:conversationId/resume.json'
        },
        messages: {
          list: '/home/inbox/conversations/:conversationId/messages.json',
          create: '/home/inbox/conversations/:conversationId/messages.json',
          prepareAttachment: '/home/inbox/conversations/:conversationId/prepare-attachment',
          addAttachment: '/home/inbox/conversations/:conversationId/add-attachment'
        }
      }
    },
    agendaAdminInbox: {
      settings: {
        context: 'agenda',
        prefix: '/:slug/admin/inbox',
        lang,
        apiRoot: `http://localhost:${config.port}`,
        perPageLimit: 20,
        emptyInboxLabel: 'agendaInboxDesc',
        displayHelp: true,
        hideTitle: true
      },
      res: {
        author: '/agendas/:agendaUid/inbox/author.json',
        conversations: {
          create: '/agendas/:agendaUid/inbox/conversations.json',
          list: '/agendas/:agendaUid/inbox/conversations.json',
          action: '/agendas/:agendaUid/inbox/conversations/:conversationId/action/:code.json',
          resume: '/agendas/:agendaUid/inbox/conversations/:conversationId/resume.json'
        },
        messages: {
          list: '/agendas/:agendaUid/inbox/conversations/:conversationId/messages.json',
          create: '/agendas/:agendaUid/inbox/conversations/:conversationId/messages.json',
          prepareAttachment: '/home/inbox/conversations/:conversationId/prepare-attachment',
          addAttachment: '/agendas/:agendaUid/inbox/conversations/:conversationId/add-attachment'
        }
      }
    },
    members: {
      settings: {
        prefix: '/:slug/admin/members',
        lang,
        apiRoot: `http://localhost:${config.port}`,
        perPageLimit: 20
      },
      res: {
        app: '/:slug/admin/members',
        list: '/:slug/admin/members.json',
        update: '/:slug/admin/members/:id',
        remove: '/:slug/admin/members/:id',
        invite: '/:slug/admin/members/invite',
        resend: '/:slug/admin/members/:id/invite/resend',
        stats: '/:slug/admin/members/stats',
        showContributor: '/:slug/admin?contributorId=:contributorId',
        exportToCsv: '/:slug/admin/members.csv',
        exportToXlsx: '/:slug/admin/members.xlsx',
        sendMessage: '/:slug/admin/members/send-message'
      }
    },
    legacyEmbeds: {
      prefix: '/:slug/admin/embeds',
      lang,
      apiRoot: `http://localhost:${config.port}`,
      res: {
        legacy: '/agendas/:agendaUid/admin/webembed',
        events: '/api/agendas/:agendaUid/events?state[]=2&state[]=1&state[]=0',
        embeds: '/api/agendas/:agendaUid/embeds',
        preview: '/agendas/:agendaUid/previewEmbeds/:embedUid/events',
        previewScript: '/js/embed/cibulBodyWidget.js',
        agendaSettings: '/api/agendas/:agendaUid'
      }
    },
    agendaActivities: {
      settings: {
        prefix: '/:slug/admin/activities',
        lang,
        apiRoot: `http://localhost:${config.port}`,
        perPageLimit: 20
      },
      res: {
        list: '/:slug/admin/activities/list',
      }
    },
    agendaStats: {
      settings: {
        prefix: '/:slug/admin/statistics',
        lang,
        apiRoot: `http://localhost:${config.port}`
      },
      res: {
        jsonExport: '/agendas/:uid/admin/events.v2.json',
        statsConfig: '/:slug/admin/statistics/config'
      }
    },
    eventAdmin: {
      settings: {
        prefix: '/:slug/admin/events',
        lang,
        apiRoot: `http://localhost:${config.port}`,
        perPageLimit: 20
      },
      res: {
        jsonExport: '/agendas/:uid/admin/events.v2.json'
      }
    },
    // Admin
    adminSupport: {
      settings: {
        context: 'user',
        prefix: '/admin/support',
        lang,
        apiRoot: `http://localhost:${config.port}`,
        perPageLimit: 20,
        autoFocus: true
      },
      res: {
        author: '/admin/support/author.json',
        conversations: {
          create: '/admin/support/conversations.json',
          list: '/admin/support/conversations.json',
          action: '/admin/support/conversations/:conversationId/action/:code.json',
          resume: '/admin/support/conversations/:conversationId/resume.json'
        },
        messages: {
          list: '/admin/support/conversations/:conversationId/messages.json',
          create: '/admin/support/conversations/:conversationId/messages.json',
          prepareAttachment: '/admin/support/conversations/:conversationId/prepare-attachment',
          addAttachment: '/admin/support/conversations/:conversationId/add-attachment'
        }
      }
    },
    supervisor: {
      settings: {
        prefix: '/supervisor',
        lang,
        apiRoot: `http://localhost:${config.port}`
      }
    }
  };
};

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
      '/home',
      '/home/events',
      '/home/activities',
      '/settings(/*?)?',
      '/new',
      '/home/inbox(/*?)?',
      '/support(/*?)?',
      '/:slug/admin/events(/*?)?',
      '/:slug/admin/inbox(/*?)?',
      '/:slug/admin/sources(/*?)?',
      '/:slug/admin/members(/*?)?',
      '/:slug/admin/embeds(/*?)?',
      '/:slug/admin/activities(/*?)?',
      '/:slug/admin/statistics(/*?)?',
      '/:slug/admin/getting-started(/*?)?',
      '/:slug/admin/settings(/*?)?',
      // Admin
      '/admin/support(/*?)?',
      '/supervisor(/*?)?'
    ],
    cmn.loadLogger('webapp'),
    cmn.loadBaseData('oasfmain.css'),
    outdatedBrowserMw,
    (req, res, next) => matchMw({
      initialState,
      // publicPath: devServerPort ? `//${devServerHost}:${devServerPort}/dist/react-integration-app` : undefined
    })(req, res, next)
  );
};

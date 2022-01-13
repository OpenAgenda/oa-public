'use strict';

const path = require('path');
const express = require('express');
const httpProxy = require('http-proxy');
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

function getSupportMessage(req, lang) {
  switch (req.query.subject) {
    case 'agendaSchema':
      return getInboxLabel('agendaSchemaDesc', lang);
    case 'privateAgenda':
      return getInboxLabel('privateAgendaDesc', lang);
    case 'publicAgenda':
      return null;
    case 'officialAgenda':
      return getInboxLabel('officialAgendaDesc', lang);
    case 'limitDates':
      return getInboxLabel('limitDatesDesc', lang);
    case 'moderators':
      return getInboxLabel('moderatorsDesc', lang);
    case 'writeToAll':
      return getInboxLabel('writeToAllDesc', lang);
    default:
      return getInboxLabel('supportInboxDesc', lang);
  }
}

function getSupportCreationSubtitle(req, lang) {
  switch (req.query.subject) {
    case 'agendaSchema':
      return getInboxLabel('agendaSchemaTitle', lang);
    case 'privateAgenda':
      return getInboxLabel('privateAgendaTitle', lang);
    case 'publicAgenda':
      return getInboxLabel('publicAgendaTitle', lang);
    case 'officialAgenda':
      return getInboxLabel('officialAgendaTitle', lang);
    case 'limitDates':
      return getInboxLabel('limitDatesTitle', lang);
    case 'moderators':
      return getInboxLabel('moderatorsTitle', lang);
    case 'writeToAll':
      return getInboxLabel('writeToAllTitle', lang);
    default:
      return null;
  }
}

function getSupportConversationType(req) {
  switch (req.query.subject) {
    case 'agendaSchema':
      return 'request_agenda_schema';
    case 'privateAgenda':
      return 'request_private_agenda';
    case 'publicAgenda':
      return 'request_public_agenda';
    case 'officialAgenda':
      return 'request_official_agenda';
    case 'limitDates':
      return 'request_limit_dates';
    case 'moderators':
      return 'request_moderators';
    case 'writeToAll':
      return 'request_write_to_all';
    default:
      return 'support';
  }
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
          edit: '/:slug/contribute/event/:eventUid'
        },
        messages: '/home/messages',
        notifs: '/home/notifications',
        search: '/agendas',
        members: '/api/agendas/:agendaUid/members'
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
        apiRoot
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
        apiRoot: `http://localhost:${config.port}`
      },
      res: {
        agenda: '/:slug',
        addEvent: '/:slug/contribute',
        createEmbed: '/:slug/admin/embeds',
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
        apiRoot: `http://localhost:${config.port}`,
        perPageLimit: 20,
        creationDesc: getSupportMessage(req, lang),
        creationSubtitle: getSupportCreationSubtitle(req, lang),
        // displayHelp: true,
        hideEmptyList: true, // redirect on creation if the list is empty
        allowCreateConversation: true, // show creation button
        topListForm: true,
        defaultQuery: {
          type: getSupportConversationType(req),
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
        apiRoot: `http://localhost:${config.port}`,
        perPageLimit: 20
      },
      res: {
        app: '/:slug/admin/members',
        list: '/:slug/admin/members.json',
        update: '/api/agendas/:agendaUid/members/:userUid',
        remove: '/api/agendas/:agendaUid/members/:userUid',
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
    agendaContribute: {
      settings: {
        prefix: '/:slug/contribute',
        lang,
        apiRoot: `https://localhost:${config.port}`,
      },
      res: {
        agenda: '/api/agendas/:agendaUid',
        members: '/api/agendas/:agendaUid/members',
        event: '/api/agendas/:agendaUid/events/:eventUid?detailed=1&useDateHoursMinutesFormat=1',
        eventContext: '/api/me/agendas/:agendaUid/events/:eventUid',
        agendaContext: '/api/me/agendas/:agendaUid',
        requestContribute: '/:agendaSlug/request-contribute/conversation/create/thiswillbreakthestorybook',
        detailedAgenda: '/api/agendas/:agendaUid?detailed=1&includeNonDataFields=1',
        locations: {
          get: '/locations/:uid.json',
          index: '/api/agendas/:agendaUid/locations?itemsKey=items',
          create: '/agendas/:agendaUid/locations',
          geocode: '/locations/geocode',
          reverse: '/locations/geocode/reverse',
          insee: '/locations/insee',
          default: '/agendas/:agendaUid/locations',
        },
        references: '/api/agendas/:agendaUid/events',
        suggestions: '/agendas/:agendaUid/events/suggestions',
        suggestChangeRes: '/:agendaSlug/admin/events/:eventSlug/contact',
        showEvent: '/agendas/:agendaUid/events/:eventUid',
        showMyEvents: '/home/events',
        contactAdministrators: '/agendas/:agendaUid/events/:eventUid/contact'
      },
      memberFreshness: new Date(60 * 60 * 24 * 30 * 120 * 1000),
      files: {
        maxSize: config.maxFileSize,
        store: {
          type: 's3',
          bucket: config.aws.bucket
        }
      },
      tiles: config.tiles
    },
    agendaActivities: {
      settings: {
        prefix: '/:slug/admin/activities',
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
        apiRoot: `http://localhost:${config.port}`,
        perPageLimit: 20,
        mapTiles: config.tiles
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
      '/:slug/contribute(/*?)?',
      // Admin
      '/admin/support(/*?)?',
      '/supervisor(/*?)?'
    ],
    cmn.loadLogger('webapp'),
    cmn.loadBaseData('oasfmain.css'),
    // outdatedBrowserMw, // Already added with loadBaseData
    (req, res, next) => matchMw({
      initialState,
      apiRoot
      // publicPath: devServerPort ? `//${devServerHost}:${devServerPort}/dist/react-integration-app` : undefined
    })(req, res, next)
  );
};

'use strict';

const path = require('path');
const _ = require('lodash');
const express = require('express');
const httpProxy = require('http-proxy');
const matchMw = require('@openagenda/react-integration-app/middleware');
const inboxLabels = require( '@openagenda/labels/inboxes' );
const makeLabelGetter = require( '@openagenda/labels' );
const config = require('../config');
const cmn = require('../lib/commons-app');

const getInboxLabel = makeLabelGetter(inboxLabels);

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
      prefix: '/:slug/admin/sources',
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
      getAgenda: '/:slug'
    }
  },
  agendaSettingsEdit: {
    settings: {
      prefix: '/:slug/admin/settings',
      lang: req.lang,
      apiRoot: `http://localhost:${config.port}`
    },
    res: {
      slugAvailable: '/agendas/slugs/available',
      set: '/:slug/admin/settings/edit',
      uploadImage: '/:slug/admin/settings/setImage',
      clearImage: '/:slug/admin/settings/clearImage',
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
      lang: req.lang,
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
      lang: req.lang,
      apiRoot: `http://localhost:${config.port}`,
      perPageLimit: 20,
      creationDesc: getInboxLabel( 'supportInboxDesc', req.lang ),
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
      lang: req.lang,
      apiRoot: `http://localhost:${config.port}`,
      perPageLimit: 20,
      emptyInboxLabel: 'agendaInboxDesc',
      displayHelp: true
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
      lang: req.lang,
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
      writeToMember: '/messages/new?uuid=:uid&redirect=:redirect',
      exportToCsv: '/:slug/admin/members.csv',
      exportToXlsx: '/:slug/admin/members.xlsx',
      sendMessage: '/:slug/admin/members/send-message'
    }
  },
  agendaActivities: {
    settings: {
      prefix: '/:slug/admin/activities',
      lang: req.lang,
      apiRoot: `http://localhost:${config.port}`,
      perPageLimit: 20
    },
    res: {
      list: '/:slug/admin/activities/list',
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
      '/home',
      '/home/events',
      '/home/activities',
      '/settings/?*?',
      '/new',
      '/home/inbox/?*?',
      '/support/?*?',
      '/:slug/admin/inbox/?*?',
      '/:slug/admin/sources/?*?',
      '/:slug/admin/members/?*?',
      '/:slug/admin/activities/?*?',
      '/:slug/admin/settings/?*?'
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

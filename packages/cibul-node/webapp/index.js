'use strict';

const path = require('path');
const _ = require('lodash');
const express = require('express');
const matchMw = require('@openagenda/react-integration-app/middleware');
const activitiesSvc = require('@openagenda/activities');
const { Inbox } = require('@openagenda/inboxes');
const config = require('../config');
const cmn = require('../lib/commons-app');

const apiRoot = `http://localhost:${config.port}`;
const phpPrefix = process.env.NODE_ENV === 'development' ? '/frontend_dev.php' : '';

const initialState = req => ({
  home: {
    settings: {
      prefix: '/home', // for links
      rootPrefix: '/home(|/events)', // because of /home/activities
      apiRoot,
      lang: req.lang,
      perPageLimit: 20,
      isNew: _.get( req, 'user.isNew' ),
      displayLegacyMessageTab: false,
      userId: _.get( req, 'user.id' ),
      userUid: _.get( req, 'user.uid' )
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
  }
});

module.exports = app => {
  app.use(
    '/dist/react-integration-app',
    express.static(path.join(
      path.dirname(require.resolve('@openagenda/react-integration-app/package.json')),
      'dist'
    )),
    (req, res, next) => res.status(404).send(404) // if not, unhandled files will be handled by following routes
  );

  app.get(
    ['/home', '/home/events', '/home/activities', '/settings/?*?', '/new'],
    cmn.loadLogger('webapp'),
    cmn.loadBaseData('oasfmain.css'),
    (req, res, next) => matchMw({
      initialState,
      apiRoot,
      lang: req.lang,
      hasInboxNews
    })(req, res, next)
  );
};

function notificationsCounter(req) {
  return activitiesSvc.feed({
    entityType: 'user',
    entityUid: req.user.uid
  }).notifications.count({ state: 0 });
}

async function hasInboxNews(req) {
  const { data } = await Inbox.user(req.user.uid).conversations.list(0, 1);
  const timestamp = _.get(data, '[0].latestMessage.createdAt');

  if (!timestamp) {
    return false;
  } else if (!req.user.lastInboxCheck) {
    return true;
  } else if (timestamp > req.user.lastInboxCheck) {
    return true;
  }

  return false;
}

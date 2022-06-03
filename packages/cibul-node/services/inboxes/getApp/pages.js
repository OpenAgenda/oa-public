'use strict';

const cmn = require('../../../lib/commons-app');

const render = require('./render');

const renderContactInboxApp = require('./renders/contactInboxApp');
const renderMemberContactApp = require('./renders/memberContactApp');
const renderEditionRequestApp = require('./renders/editionRequestApp');
const renderEventContactApp = require('./renders/eventContactApp');
const renderAdminEventContactApp = require('./renders/adminEventContactApp');
const renderRequestContributeApp = require('./renders/requestContributeApp');
const renderSuggestLocationChangeApp = require('./renders/suggestLocationChangeApp');

function eventLoader(events) {
  return (req, res, next) => {
    events.get({
      slug: req.params.eventSlug
    }, {
      access: 'internal',
      includeImagePath: true,
      private: null
    }).then(event => {
      req.event = event;
      next();
    }, next);
  };
}

function checkUser(req, res, next) {
  if (!req.user) {
    const error = new Error('Unauthorized');

    error.statusCode = 401;
    res.statusCode = 401;

    return next(error);
  }

  return next();
}

module.exports = (app, config, services) => {
  const {
    sessions,
    users: usersSvc,
    agendas,
    members,
    events,
    agendaLocations
  } = services;

  const loadEvent = eventLoader(events);

  app.get(
    '/home/inbox/refresh-check',
    sessions.mw.load(),
    checkUser,
    (req, res, next) => {
      usersSvc.refresh(req.user.uid, {
        lastInboxCheck: true
      }).then(() => res.sendStatus(200)).catch(next);
    }
  );

  app.use(
    '/:slug/contact',
    sessions.mw.loadOrRedirect(),
    agendas.mw.loadBy({
      path: 'params.slug',
      field: 'slug'
    }),
    members.mw.load,
    cmn.loadBaseData('oa-main.css'),
    renderContactInboxApp({ render, config })
  );

  app.use(
    '/:slug/admin/members/:memberId/contact',
    sessions.mw.loadOrRedirect(),
    agendas.mw.loadBy({
      path: 'params.slug',
      field: 'slug'
    }),
    agendas.mw.authorizeByIPAddress(),
    members.mw.loadTarget.options({ detailed: true }),
    members.mw.loadAndAuthorize('moderator'),
    cmn.loadBaseData('oa-main.css'),
    renderMemberContactApp({ render, services, config })
  );

  app.use(
    '/:slug/admin/events/:eventSlug/contact',
    sessions.mw.loadOrRedirect(),
    agendas.mw.loadBy({
      path: 'params.slug',
      field: 'slug'
    }),
    agendas.mw.authorizeByIPAddress(),
    cmn.loadBaseData('oa-main.css'),
    members.mw.loadAndAuthorize('moderator'),
    loadEvent,
    renderAdminEventContactApp({ render, config })
  );

  app.use(
    '/:slug/events/:eventSlug/contact',
    sessions.mw.loadOrRedirect(),
    agendas.mw.loadBy({
      path: 'params.slug',
      field: 'slug'
    }),
    members.mw.load,
    cmn.loadBaseData('oa-main.css'),
    loadEvent,
    renderEventContactApp({ render, config })
  );

  app.use(
    '/:slug/admin/events/:eventSlug/edition-request',
    sessions.mw.loadOrRedirect(),
    agendas.mw.loadBy({
      path: 'params.slug',
      field: 'slug'
    }),
    agendas.mw.authorizeByIPAddress(),
    members.mw.loadAndAuthorize('moderator'),
    cmn.loadBaseData('oa-main.css'),
    loadEvent,
    renderEditionRequestApp({ render, config })
  );

  app.use(
    '/:slug/request-contribute',
    sessions.mw.loadOrRedirect(),
    agendas.mw.loadBy({
      path: 'params.slug',
      field: 'slug'
    }),
    members.mw.load,
    cmn.loadBaseData('oa-main.css'),
    renderRequestContributeApp({ services, config, render })
  );

  app.use(
    '/:slug/locations/:locationUid/suggest-change',
    sessions.mw.loadOrRedirect(),
    agendas.mw.loadBy({
      path: 'params.slug',
      field: 'slug'
    }),
    members.mw.load,
    cmn.loadBaseData('oa-main.css'),
    (req, res, next) => {
      agendaLocations.get(req.params.locationUid.split('.').pop())
        .then(location => {
          req.location = location;
          next();
        }, next);
    },
    renderSuggestLocationChangeApp({ config, render })
  );
};

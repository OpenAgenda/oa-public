'use strict';

const _ = require('lodash');
const contribute = require('@openagenda/agenda-contribute');
const outdatedBrowserMw = require('@openagenda/outdated-browser/middleware');

const cmn = require('../../lib/commons-app');
const loadLegacyRoutes = require('./legacy');
const mw = require('./middlewares');
const memberSchema = require('./lib/memberSchema');
const isDraftRequested = require('./lib/isDraftRequested');
const redirectToSignup = require('./lib/redirectToSignup');

const agendaNotFound = ns => (req, res, next) => (req[ns] ? next() : cmn.errorResponse(req, res, { code: 404 }));

const setInReq = obj => (req, res, next) => {
  Object.assign(req, obj);
  next();
};

module.exports = (config, services) => parentApp => {
  const {
    agendas,
    sessions,
    members
  } = services;

  const { bucket } = config.aws;

  parentApp.use(
    '/dist/contribute',
    contribute.dist,
    (req, res) => res.send(404) // if not, unhandled files will be handled by following routes
  );

  parentApp.all([
    '/:agendaSlug/contribute',
    '/:agendaSlug/contribute/:step',
    '/:agendaSlug/contribute/event/:eventUid',
    '/:agendaSlug/contribute/event/:eventUid/draft',
    '/:agendaSlug/contribute/event/:eventUid/from/:fromAgendaUid'
  ], [
    agendas.mw.load,
    agendaNotFound('agenda'),
    agendas.mw.authorizeByIPAddress(),
    (req, res, next) => {
      if (!req.agenda.credentials.useContributeApp) {
        return res.redirect(`/${req.agenda.slug}/addevent`);
      }
      next();
    }
  ]);
  parentApp.all(
    '/:agendaSlug/contribute/event/:eventUid/from/:fromAgendaUid',
    agendas.mw.loadBy({
      path: 'params.fromAgendaUid',
      field: 'uid',
      target: 'fromAgenda'
    }),
    mw.isReferenced({
      andPublished: mw.isReferenced.redirectToSharedEventWithMessage,
      andNotPublished: mw.isReferenced.redirectBackWithMessage
    }),
    agendaNotFound('fromAgenda')
  );

  parentApp.all([
    '/:agendaSlug/contribute/event/:eventUid',
    '/:agendaSlug/contribute/event/:eventUid/draft',
    '/:agendaSlug/contribute/event/:eventUid/from/:fromAgendaUid'
  ], mw.event);

  parentApp.all([
    '/:agendaSlug/contribute',
    '/:agendaSlug/contribute/:step',
    '/:agendaSlug/contribute/event/:eventUid',
    '/:agendaSlug/contribute/event/:eventUid/draft',
    '/:agendaSlug/contribute/event/:eventUid/from/:fromAgendaUid'
  ], [
    sessions.mw.ifUnlogged(redirectToSignup),
    mw.member.bind(null, members),
    mw.schemaExtensions,
    mw.duplicateFromEvent
  ]);

  parentApp.all([
    '/:agendaSlug/contribute',
    '/:agendaSlug/contribute/:step'
  ], mw.verifyMemberAuthorization);

  parentApp.all([
    '/:agendaSlug/contribute/event/:eventUid',
    '/:agendaSlug/contribute/event/:eventUid/draft',
    '/:agendaSlug/contribute/event/:eventUid/from/:fromAgendaUid'
  ], mw.verifyMemberAuthorization.edit);

  parentApp.get(
    '/:agendaSlug/contribute/event',
    setInReq({ mode: 'create' })
  );
  parentApp.post(
    '/:agendaSlug/contribute/event',
    setInReq({ mode: 'create' }),
    isDraftRequested({ draft: true })
  );

  parentApp.all(
    '/:agendaSlug/contribute/event/:eventUid',
    setInReq({ mode: 'edit' })
  );

  parentApp.get(
    '/:agendaSlug/contribute/event/:eventUid/draft',
    setInReq({ mode: 'create', draft: true })
  );

  parentApp.get(
    '/:agendaSlug/contribute/event/:eventUid/from/:fromAgendaUid',
    mw.validateNonEditableEventStandardFields
  );

  parentApp.all(
    '/:agendaSlug/contribute/event/:eventUid/from/:fromAgendaUid',
    setInReq({ mode: 'add' }),
    mw.addAndRedirectIfNothingToEdit
  );

  parentApp.post(
    '/:agendaSlug/contribute/event/:eventUid/draft',
    setInReq({ mode: 'edit' }),
    isDraftRequested({ draft: true })
  );

  parentApp.get(
    '/:agendaSlug/contribute/event/:eventUid',
    mw.defineBackRedirect
  );

  parentApp.all(
    [
      '/:agendaSlug/contribute',
      '/:agendaSlug/contribute/:step',
      '/:agendaSlug/contribute/event/:eventUid',
      '/:agendaSlug/contribute/event/:eventUid/draft',
      '/:agendaSlug/contribute/event/:eventUid/from/:fromAgendaUid'
    ],
    outdatedBrowserMw,
    (req, res, next) => {
      req.config = {
        draft: !!(req.event?.draft || req.draft),
        lang: req.lang,
        base: `/${req.agenda.slug}/contribute`,
        mode: req.mode,
        authorizations: req.authorizations,
        locationRes: {
          get: '/locations/:uid.json',
          index: `/agendas/${req.agenda.uid}/locations.json?sample=1`,
          create: `/agendas/${req.agenda.uid}/locations`,
          geocode: '/locations/geocode',
          reverse: '/locations/geocode/reverse',
          insee: '/locations/insee',
          default: `/agendas/${req.agenda.uid}/locations`,
        },
        referencesRes: `/api/agendas/${req.event ? req.event.agendaUid : req.agenda.uid}/events`,
        suggestionsRes: req.params.eventUid ? `/agendas/${req.agenda.uid}/events/${req.params.eventUid}/suggestions` : `/agendas/${req.agenda.uid}/events/suggestions`,
        suggestChangeRes: req.params.eventUid ? `/${req.agenda.slug}/admin/events/${req.event.slug}/contact` : null,
        fileStore: { type: 's3', bucket },
        redirects: {
          back: req.backRedirect || (req.params.fromAgendaUid ? `/agendas/${req.params.fromAgendaUid}/events/${req.event.uid}` : null),
          seeEvent: `/agendas/${req.agenda.uid}/events/:eventUid`,
          createOtherEvent: `/${req.agenda.slug}/contribute`,
          duplicateEvent: `/${req.agenda.slug}/contribute?eventUid=:eventUid`,
          seeAllEvents: '/home/events',
          contactAdministrators: req.params.eventUid ? `/agendas/${req.agenda.uid}/events/:eventUid/contact` : `/${req.agenda.slug}/contact`,
          draft: '/home/events'
        },
        member: {
          dataIsRequired: _.get(req, 'agenda.settings.contribution.useFields', false),
          schema: memberSchema(req.agenda.uid)
        },
        event: {
          message: _.get(req, 'agenda.settings.contribution.messages.instructions')
        },
        confirmation: {
          message: _.get(req, 'agenda.settings.contribution.messages.complete'),
          state: _.get(req, 'agenda.settings.contribution.defaultState', 2)
        },
        standardFieldsErrors: req.standardFieldsErrors ?? []
      };

      req.translateMode = Boolean(req.cookies.translateMode);
      req.isTranslator = req.user?.uid && config.translators.includes(req.user.uid);

      if (!req.scripts) req.scripts = {};
      if (!req.scripts.top) req.scripts.top = [];
      if (!req.scripts.bottom) req.scripts.bottom = [];

      if (req.outdatedBrowser) {
        req.scripts.top.push(
          { body: `window.outdatedBrowserOptions = { language: "${req.lang}" };` },
          { src: contribute.getClientScriptPath('outdated.js') }
        );
      }

      if (req.cookies.translateMode) {
        req.scripts.top.push(
          { body: 'window._jipt = [[\'project\', \'openagenda\']];' },
          { src: '//cdn.crowdin.com/jipt/jipt.js' }
        );
      }

      if (config.matomoCloudCode) {
        req.scripts.bottom.push({
          body: config.matomoCloudCode
        });
      }

      next();
    }
  );

  parentApp.use('/:agendaSlug/contribute', contribute.app);

  loadLegacyRoutes(parentApp);
};

"use strict";

const _ = require('lodash');
const qs = require('qs');

const agendas = require('@openagenda/agendas');
const contribute = require('@openagenda/agenda-contribute');

const layout = require('../lib/layouts').agenda;

const loadLegacyRoutes = require('./legacy');

const cmn = require('../../lib/commons-app');

const middlewares = require('./middlewares');
const interfaces = require('./interfaces');
const memberSchema = require('./lib/memberSchema');

const base64 = require('@openagenda/utils/base64');

let bucket;

const agendaNotFound = ns => (req, res, next) => req[ns] ? next() : cmn.errorResponse(req, res, { code: 404 })
const setInReq = obj => (req, res, next) => {
  Object.assign(req, obj);
  next();
};

module.exports = Object.assign((parentApp, path = '') => {
  const {
    agendas,
    sessions,
    members
  } = parentApp.services;

  parentApp.use('/dist/contribute',
    contribute.dist,
    (req, res, next) => res.send(404) // if not, unhandled files will be handled by following routes
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
      target: 'fromAgenda'
    }),
    agendaNotFound('fromAgenda')
  );

  parentApp.all([
    '/:agendaSlug/contribute/event/:eventUid',
    '/:agendaSlug/contribute/event/:eventUid/draft',
    '/:agendaSlug/contribute/event/:eventUid/from/:fromAgendaUid'
  ], middlewares.event);

  parentApp.all([
    '/:agendaSlug/contribute',
    '/:agendaSlug/contribute/:step',
    '/:agendaSlug/contribute/event/:eventUid',
    '/:agendaSlug/contribute/event/:eventUid/draft'
  ], [
    sessions.mw.ifUnlogged(_redirectToSignup),
    middlewares.member.bind(null, members),
    middlewares.schemaExtensions,
    middlewares.duplicateFromEvent
  ]);

  parentApp.get([
    '/:agendaSlug/contribute',
    '/:agendaSlug/contribute/:step'
  ], middlewares.verifyMemberAuthorization);

  parentApp.get([
    '/:agendaSlug/contribute/event/:eventUid',
    '/:agendaSlug/contribute/event/:eventUid/draft',
    '/:agendaSlug/contribute/event/:eventUid/from/:fromAgendaUid'
  ], middlewares.verifyMemberAuthorization.edit);

  parentApp.all([
    '/:agendaSlug/contribute/event',
    '/:agendaSlug/contribute/event/:eventUid/draft'
  ], setInReq({ mode: 'create' }));
  parentApp.all(
    '/:agendaSlug/contribute/event/:eventUid',
    setInReq({ mode: 'edit' })
  );
  parentApp.all(
    '/:agendaSlug/contribute/event/:eventUid/from/:fromAgendaUid',
    setInReq({ mode: 'add' })
  );

  parentApp.get('/:agendaSlug/contribute/event/:eventUid',
    middlewares.defineUpdateRedirect
 );

  parentApp.all([
    '/:agendaSlug/contribute',
    '/:agendaSlug/contribute/:step',
    '/:agendaSlug/contribute/event/:eventUid',
    '/:agendaSlug/contribute/event/:eventUid/draft'
  ], (req, res, next) => {
    req.config = {
      lang: req.lang,
      base: `/${req.agenda.slug}/contribute`,
      mode: req.mode,
      authorizations: req.authorizations,
      locationRes: {
        get: `/locations/:uid.json`,
        index: `/agendas/${req.agenda.uid}/locations.json?sample=1`,
        create: `/agendas/${req.agenda.uid}/locations`,
        geocode: `/locations/geocode`,
        reverse: `/locations/geocode/reverse`,
        insee: `/locations/insee`,
        default: `/agendas/${req.agenda.uid}/locations`,
      },
      referencesRes: `/agendas/${req.agenda.uid}/events`,
      suggestionsRes: req.params.eventUid ? `/agendas/${req.agenda.uid}/events/${req.params.eventUid}/suggestions` : `/agendas/${req.agenda.uid}/events/suggestions`,
      fileStore: { type: 's3', bucket },
      redirects: {
        updated: req.updateRedirect,
        seeEvent: `/agendas/${req.agenda.uid}/events/:eventUid`,
        createOtherEvent: `/${req.agenda.slug}/contribute`,
        duplicateEvent: `/${req.agenda.slug}/contribute?eventUid=:eventUid`,
        seeAllEvents: `/home/events`,
        contactAdministrators: req.params.eventUid ? `/agendas/${req.agenda.uid}/events/:eventUid/contact` : `/${req.agenda.slug}/contact`,
        draft: `/home/events`
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
      }
    }

    next();
  });

  parentApp.use('/:agendaSlug/contribute', contribute.app);

  loadLegacyRoutes(parentApp);
}, {
  init
});

function init(config, services) {
  bucket = config.aws.bucket;

  contribute.init({
    logger: config.getLogConfig('svc', 'agendaContribute'),
    CDNPath: config.aws.servicesBucketPath,
    mapboxKey: config.mapboxAccessToken,
    maxFileSize: parseInt(config.maxFileSize / 1000000),
    frontAppPath: process.env.NODE_ENV !== 'production' ? '/dist/contribute' : null,
    layout,
    middlewares,
    interfaces: interfaces(services)
  });

  return {
    mw: middlewares
  }
}


function _redirectToSignup(req, res) {
  const query = {
    redirect: base64.encode(req.originalUrl)
  };

  if (req.lang !== 'fr') {
    query.lang = req.lang;
  }

  if (req.query.defaults) {
    query.defaults = req.query.defaults;
  }

  res.redirect(302, `/${req.agenda.slug}/signup?${qs.stringify(query)}`);
}

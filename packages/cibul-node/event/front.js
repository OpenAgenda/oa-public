'use strict';

const _ = require('lodash');
const ih = require('immutability-helper');
const qs = require('qs');
const base64 = require('@openagenda/utils/base64');
const determineEventCancellationFromTitle = require('@openagenda/utils/cancellation/determineFromTitle');

const agendaSvc = require('@openagenda/agendas');

const getLabel = require('@openagenda/labels')(require('@openagenda/labels/event/show'));
const errorLabels = require('@openagenda/labels/errors');
const sessions = require('@openagenda/sessions');

const members = require('../services/members');

const cacheMw = require('../lib/cache.mw');
const cmn = require('../lib/commons-app');
const config = require('../config');
const embedSvc = require('../services/embed');
const legacyEventSvc = require('../services/event');
const legacyAgendaSvc = require('../services/agenda');
const redirectMiddelware = require('./redirect.middleware')(config);

const getAndDecorateIndexedEvent = require('./lib/getAndDecorateIndexedEvent');
const getAgendaReferences = require('./lib/getAgendaReferences');
const getEventLayoutData = require('./lib/getEventLayoutData');

function getRouteValues(req, keys) {
  const routeValues = [];

  [].concat(keys).forEach(k => {
    routeValues[k] = req.params[k];
  });

  return routeValues;
}

const googleItineraryLink = (lat, lng) => `https://www.google.com/maps/dir//${lat},${lng}/@${lat},${lng},17z`;
const OSMItineraryLink = (lat, lng) => `https://www.openstreetmap.org/directions?to=${lat}%2C${lng}`;

function redirect(req, res, next) {
  if (!req.agenda || !req.event) {
    return next({ code: 404 });
  }
  if (req.query.sharemodal) {
    return res.redirect(301, `${config.root}/${req.agenda.slug}/events/${req.event.slug}?sharemodal${req.query.lang ? `&lang=${req.query.lang}` : ''}`);
  }
  res.redirect(301, `${config.root}/${req.agenda.slug}/events/${req.event.slug}${req.query.lang ? `?lang=${req.query.lang}` : ''}`);
}

function formatSocialLinks(req, res, next) {
  let siteUrl = false;
  let eventUrl;

  if (req.agenda) {
    eventUrl = `${config.root}/${req.agenda.slug}/events/${req.event.slug}`;

    siteUrl = `${config.root}/${req.agenda.slug}`;
  } else {
    eventUrl = `${config.root}/events/${req.event.slug}`;
  }

  if (req.embed) {
    if (req.embed.getSiteUrl()) {
      siteUrl = req.embed.getSiteUrl();

      eventUrl = `${siteUrl}?oaq[uid]=${req.event.uid}`;
    }
  }

  _.merge(req.formatted, legacyEventSvc.getSocialLinks(req.event, eventUrl, siteUrl));

  if (req.embed) {
    req.formatted.facebookShare = `https://www.facebook.com/sharer.php?u=${encodeURIComponent(`${config.root}/agendas/${req.agenda.uid}/events/${req.event.uid}/share`)}`;
  }

  next();
}

function formatAgendaLinks(uri, keys) {
  return (req, res, next) => {
    const routeValues = getRouteValues(req, keys);

    const baseSearchQuery = {};

    if (req.query.fb) routeValues.fb = 1;

    if (req.query.oaq && req.query.oaq.passed !== undefined) {
      baseSearchQuery.passed = req.query.oaq.passed;
    }

    req.formatted.backLink = req.genUrl(uri, [
      routeValues,
      req.query.oaq ? { oaq: req.query.oaq } : {},
      { lang: req.lang },
    ]);

    // link to go back to the agenda
    req.formatted.backLabel = getLabel('back', req.lang);

    // link to results for event location in agenda
    req.formatted.locationLink = req.genUrl(uri, [
      routeValues,
      { oaq: _.extend({ location: req.event.getLocationUid() }, baseSearchQuery) },
      { lang: req.lang },
    ]);

    req.formatted.googleItineraryLink = googleItineraryLink(req.event.getLatitude(), req.event.getLongitude());
    req.formatted.osmItineraryLink = OSMItineraryLink(req.event.getLatitude(), req.event.getLongitude());

    // link to results for same category in agenda
    req.formatted.categoryLink = false;

    if (req.formatted.categorySlug) {
      req.formatted.categoryLink = req.genUrl(uri, [
        routeValues,
        { oaq: _.extend({ category: req.formatted.categorySlug }, baseSearchQuery) },
        { lang: req.lang },
      ]);
    }

    next();
  };
}

function _appendFacebookParams(req, res, next) {
  if (!req.query.fb) return next();

  // to add 'fb' class to layout html
  req.baseData.facebook = true;

  req.baseData.scriptParams.facebook = true;

  req.baseData.scriptParams.fbAppId = config.auth.facebook.id;

  next();
}

function _switchEmbedLang(req, res, next) {
  req.event.switchLanguage(req.lang);

  next();
}

function _appendSettings(req, res, next) {
  if (!req.agenda) return next();

  const agendaUid = req.agenda?.uid;
  const originAgendaUid = req.event?.origin?.uid;

  const agendaUids = [agendaUid];

  if (originAgendaUid) agendaUids.push(originAgendaUid);

  agendaSvc.list({ uid: agendaUids }, 0, 2, {
    private: null,
    internal: true,
    includeFields: ['settings', 'indexed', 'private', 'credentials'],
  }, (err, agendas) => {
    const agenda = agendas.filter(a => a.uid === agendaUid).shift();

    if (err) return next(err);

    req.baseData = ih(req.baseData, {
      indexed: {
        $set: _.get(agenda, 'indexed', true) && !_.get(agenda, 'private', false),
      },
      scriptParams: {
        moderatorCanPublish: {
          $set: _.get(agenda, 'settings.contribution.canPublish', ['moderators', 'administrators']).includes('moderators'),
        },
        GDPRInformation: {
          $set: agenda?.settings?.contribution?.messages?.GDPRInformation,
        },
        googleAnalyticsID: {
          $set: agenda?.settings?.tracking?.googleAnalytics,
        },
      },
      mailto: {
        $set: cmn.agendaMailTo(agenda),
      },
      useContributeApp: {
        $set: _.get(agenda, 'credentials.useContributeApp', false),
      },
      useDetailedStatusActions: {
        $set: !!agenda?.settings?.lab?.status,
      },
    });

    next();
  });
}

function _formatFavoriteLink(req, res, next) {
  req.formatted.favorite = cmn.favoriteLinkHTML(req.event.uid);

  next();
}

function _addInterfaceLanguage(req, res, next) {
  req.formatted.interfaceLang = req.lang;

  next();
}

function _formatEmbedHeadLinks(req, res, next) {
  req.formatted.actionLink = req.genUrl('agendaEventActionShow', {
    slug: req.agenda.slug,
    eventSlug: req.event.slug,
  }, { protocol: 'https://' });
  req.formatted.actionLabel = getLabel('export', req.lang);

  next();
}

async function agendaEventShow(req, res) {
  const reqParams = {};

  if (req.query.admin_nav) {
    reqParams.admin_nav = req.query.admin_nav;
  }

  const member = req.user ? await members.get({
    agendaUid: req.agenda.uid,
    userUid: req.user.uid,
  }) : null;

  cmn.render(req, res, 'event/show', {
    tiles: config.tiles,
    scriptParams: {
      root: config.root,
      contributor: member ? { uid: member.userUid } : null,
      agendaSlug: req.agenda.slug,
      agendaImage: req.agenda.image
        ? req.agenda.image
        : config.aws.defaultImagePath,
    },
    oaRoot: config.root,
    agendaId: req.agenda.id,
    agenda: req.agenda,
    agendaReferences: req.agendaReferences,
    private: req.agenda.private,
    adminNav: req.query.admin_nav,
    isOriginAgenda: req.indexedEvent?.originAgenda?.uid === req.agenda.uid,
    removeRedirect: req.query.admin_nav ? base64.encode(`/${req.agenda.slug}/admin?${qs.stringify(req.query.admin_nav)}`) : null,
    redirect: cmn.makeRedirect(req),
    isCancelled: determineEventCancellationFromTitle(req.indexedEvent.title),
    event: req.formatted,
    indexedEvent: req.indexedEvent,
    backLink: req.genUrl('agendaShow', [
      getRouteValues(req, ['slug']),
      req.query.oaq ? { oaq: req.query.oaq } : {},
      { lang: req.lang },
    ]),
    hasLocation: !!req.indexedEvent.location,
    components: req.components,
    showRequestLocation: ![2, 3].includes(_.get(member, 'role', 0)),
    user: req.user,
    footerUid: req.indexedEvent.uid,
  });
}

function renderAgendaEmbedEvent(req, res, next) {
  cmn.renderTemplate(req, 'event/embedShow', {
    eventRender: req.render,
    scriptParams: {
      res: {
        actions: req.genUrl('agendaActionShow', { slug: req.agenda.slug }),
      },
    },
  }, false, (err, render) => {
    if (err) return next(err);

    req.render = render;
    res.data = render;

    next();
  });
}

function wrap(fn) {
  return (req, res, next) => fn(req, res, next).catch(next);
}

const middlewares = {
  agendaEventShow: [
    (req, res, next) => {
      getAndDecorateIndexedEvent(req.app.services, {
        agendaUid: req.agenda.uid,
        eventSlug: req.params.eventSlug,
        userUid: req.user?.uid,
        lang: req.lang,
        originalUrl: req.originalUrl,
        detailed: true,
      }).then(indexedEvent => {
        if (!indexedEvent) {
          return next({ code: 404 });
        }

        req.indexedEvent = indexedEvent;

        next();
      }, next);
    },
    (req, res, next) => {
      getAgendaReferences(req.app.services, req.indexedEvent.uid, {
        excludeAgendaUid: req.agenda.uid,
      }).then(agendaReferences => {
        req.agendaReferences = agendaReferences;
        next();
      }, next);
    },
    cmn.loadBaseData(getEventLayoutData, 'oa-main.css'),
    wrap(agendaEventShow),
  ],
  customEmbedEventShow: [
    legacyAgendaSvc.mw.decorateEvent(false),
    formatSocialLinks,
    _formatFavoriteLink,
    _addInterfaceLanguage,
    _formatEmbedHeadLinks,
    embedSvc.mw.renderEvent,
    cmn.loadBaseData(legacyEventSvc.mw.layoutData, 'oae.css'),
    embedSvc.mw.loadCustomLayoutData,
    _appendSettings,
    renderAgendaEmbedEvent,
  ],
};

const preMw = [
  cmn.loadLogger('event front'),
  cmn.redirectLegacySearch,
];

module.exports = app => {
  const {
    agendas: agendasSvc,
  } = app.services;

  app.get(
    '/agendas/:agendaUid/events/:eventUid/share',
    preMw,
    redirectMiddelware.loadEvent,
    redirectMiddelware.loadSiteURL,
    redirectMiddelware.loadFacebookMetas,
    redirectMiddelware.render,
  );

  app.get(
    '/:slug.prv/events/:eventSlug',
    preMw,
    agendasSvc.mw.loadBy({ path: 'params.slug', field: 'slug' }),
    cmn.ifIsNot(
      'agenda.private',
      (req, res) => {
        const query = qs.stringify(req.query, { addQueryPrefix: true });

        res.redirect(302, `/${req.params.slug}/events/${req.params.eventSlug}${query}`);
      },
    ),
    sessions.mw.ifUnlogged(
      (req, res) => {
        const query = qs.stringify(req.query, { addQueryPrefix: true });
        const redirect = Buffer.from(`/${req.params.slug}.prv/events/${req.params.eventSlug}${query}`, 'utf8')
          .toString('base64');

        res.redirect(302, `/${req.params.slug}/signin?msg=limitedAccessEvent&redirect=${redirect}`);
      },
    ),
    members.mw.load,
    (req, res, next) => {
      if (!req.member) return cmn.renderUnauthorized(req, res, next);
      next();
    },
    middlewares.agendaEventShow,
  );

  app.get(
    '/:slug/events/:eventSlug',
    preMw,
    agendasSvc.mw.loadBy({ path: 'params.slug', field: 'slug' }),
    cmn.ifIs(
      'agenda.private',
      (req, res) => {
        const query = qs.stringify(req.query, { addQueryPrefix: true });

        res.redirect(302, `/${req.params.slug}.prv/events/${req.params.eventSlug}${query}`);
      },
    ),
    middlewares.agendaEventShow,
  );

  app.get(
    '/agendas/:uid/events/:eventUid',
    preMw,
    legacyAgendaSvc.mw.load('uid'),
    legacyEventSvc.mw.load('eventUid', 'uid'),
    redirect,
  );

  app.get(
    '/agendas/:uid/embed/events/:eventUid',
    preMw,
    legacyAgendaSvc.mw.load('uid'),
    legacyEventSvc.mw.load('eventUid', 'uid'),
    _switchEmbedLang,
    legacyEventSvc.mw.format,
    legacyEventSvc.mw.components,
    formatAgendaLinks('agendaEmbedShow', ['uid']),
    legacyAgendaSvc.mw.decorateEvent(false),
    formatSocialLinks,
    _formatEmbedHeadLinks,
    // cmn.useEmbedGoogleAnalytics,
    embedSvc.mw.renderEvent,
    cmn.loadBaseData(legacyEventSvc.mw.layoutData, 'oae.css'),
    _appendFacebookParams,
    renderAgendaEmbedEvent,
    (req, res) => res.send(req.render),
  );

  app.get(
    '/agendas/:uid/embeds/:embedUid/events/:eventUid',
    cacheMw('customEmbedShow', 'params.embedUid', 30, [
      preMw,
      legacyAgendaSvc.mw.load('uid'),
      embedSvc.mw.load('embedUid', 'uid'),
      legacyEventSvc.mw.load('eventUid', 'uid'),
      _switchEmbedLang,
      legacyEventSvc.mw.format,
      legacyEventSvc.mw.components,
      formatAgendaLinks('customEmbedShow', ['uid', 'embedUid']),
      middlewares.customEmbedEventShow,
      (req, res) => res.send(req.render),
    ]),
  );

  app.get(
    '/agendas/:uid/previewEmbeds/:embedUid/events/:eventUid',
    preMw,
    legacyAgendaSvc.mw.load('uid'),
    members.mw.loadAndAuthorize('administrator'),
    embedSvc.mw.load('embedUid', 'uid'),
    legacyEventSvc.mw.load('eventUid', 'uid'),
    _switchEmbedLang,
    legacyEventSvc.mw.format,
    legacyEventSvc.mw.components,
    formatAgendaLinks('customEmbedShowPreview', ['uid', 'embedUid']),
    middlewares.customEmbedEventShow,
    (req, res) => res.send(req.render),
  );

  app.get(
    '/events/:eventSlug',
    preMw,
    (req, res, next) => {
      const integer = parseInt(req.params.eventSlug, 10);

      if (Number.isInteger(integer) && (`${integer}`.length === req.params.eventSlug.length)) {
        return next('route');
      }

      next();
    },
    legacyEventSvc.mw.load('eventSlug', 'slug'),
    (req, res, next) => {
      if (req.event.origin) {
        req.agenda = req.event.origin;
        return redirect(req, res, next);
      }

      next({
        code: 403,
        message: _.get(errorLabels, ['noOrigin', req.lang], 'noOrigin.en'),
      });
    },
  );

  app.get(
    '/events/:eventUid',
    preMw,
    legacyEventSvc.mw.load('eventUid', 'uid'),
    (req, res, next) => {
      req.agenda = req.event.origin;
      next();
    },
    redirect,
  );
};

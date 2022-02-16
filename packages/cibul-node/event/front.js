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
const log = require('@openagenda/logs')('event/front');

const members = require('../services/members');

const cacheMw = require('../lib/cache.mw');
const cmn = require('../lib/commons-app');
const config = require('../config');
const embedSvc = require('../services/embed');
const legacyEventSvc = require('../services/event');
const legacyAgendaSvc = require('../services/agenda');
const redirectMiddelware = require('./redirect.middleware')(config);

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

    // link to go back to the agenda
    req.formatted.backLink = req.genUrl(uri, [
      routeValues,
      req.query.oaq ? { oaq: req.query.oaq } : {},
      { lang: req.lang }
    ]);

    req.formatted.backLabel = getLabel('back', req.lang);

    // link to results for event location in agenda
    req.formatted.locationLink = req.genUrl(uri, [
      routeValues,
      { oaq: _.extend({ location: req.event.getLocationUid() }, baseSearchQuery) },
      { lang: req.lang }
    ]);

    req.formatted.googleItineraryLink = googleItineraryLink(req.event.getLatitude(), req.event.getLongitude());
    req.formatted.osmItineraryLink = OSMItineraryLink(req.event.getLatitude(), req.event.getLongitude());

    // link to results for same category in agenda
    req.formatted.categoryLink = false;

    if (req.formatted.categorySlug) {
      req.formatted.categoryLink = req.genUrl(uri, [
        routeValues,
        { oaq: _.extend({ category: req.formatted.categorySlug }, baseSearchQuery) },
        { lang: req.lang }
      ]);
    }

    next();
  };
}

function loadAgendaCoreSettings(req, res, next) {
  req.app.services.core.agendas(req.agenda.uid).settings.get({ access: 'internal' }).then(settings => {
    req.agendaSettings = settings;

    next();
  }, err => {
    if (err) {
      log('error', 'failed to load core settings for %s', req.originalUrl);
    }

    next();
  });
}

const middlewares = {
  agendaEventShow: [
    legacyEventSvc.mw.load('eventSlug', 'slug'),
    legacyEventSvc.mw.format,
    legacyEventSvc.mw.components,
    loadAgendaCoreSettings,
    formatAgendaLinks('agendaShow', ['slug']),
    legacyAgendaSvc.mw.decorateEvent(false),
    formatSocialLinks,
    cmn.loadBaseData(legacyEventSvc.mw.layoutData, 'oasfmain.css'),
    _appendEventTransferCredential,
    _appendSettings,
    _decorateLocation,
    wrap(agendaEventShow)
  ],
  customEmbedEventShow: [
    legacyAgendaSvc.mw.decorateEvent(false),
    formatSocialLinks,
    _formatFavoriteLink,
    _addInterfaceLanguage,
    _formatEmbedHeadLinks,
    // cmn.useEmbedGoogleAnalytics,
    embedSvc.mw.renderEvent,
    cmn.loadBaseData(legacyEventSvc.mw.layoutData, 'oae.css'),
    embedSvc.mw.loadCustomLayoutData,
    _appendSettings,
    renderAgendaEmbedEvent
 ]
};

const preMw = [
  cmn.loadLogger('event front'),
  cmn.redirectLegacySearch
];

module.exports = app => {
  app.get(
    '/agendas/:agendaUid/events/:eventUid/share',
    preMw,
    redirectMiddelware.loadEvent,
    redirectMiddelware.loadSiteURL,
    redirectMiddelware.loadFacebookMetas,
    redirectMiddelware.render
  );

  app.get(
    '/:slug.prv/events/:eventSlug',
    preMw,
    cmn.https,
    legacyAgendaSvc.mw.load('slug'),
    cmn.ifIsNot(
      'agenda.private',
      (req, res) => {
        const query = qs.stringify(req.query, { addQueryPrefix: true });

        res.redirect(302, `/${req.params.slug}/events/${req.params.eventSlug}${query}`);
      }
    ),
    sessions.mw.ifUnlogged(
      (req, res) => {
        const query = qs.stringify(req.query, { addQueryPrefix: true });
        const redirect = Buffer.from(`/${req.params.slug}.prv/events/${req.params.eventSlug}${query}`, 'utf8')
          .toString('base64');

        res.redirect(302, `/${req.params.slug}/signin?msg=limitedAccessEvent&redirect=${redirect}`);
      }
   ),
    members.mw.load,
    (req, res, next) => {
      if (!req.member) return cmn.renderUnauthorized(req, res, next);
      next();
    },
    middlewares.agendaEventShow
 );

  app.get(
    '/:slug/events/:eventSlug',
    preMw,
    cmn.https,
    legacyAgendaSvc.mw.load('slug'),
    cmn.ifIs(
      'agenda.private',
      (req, res) => {
        const query = qs.stringify(req.query, { addQueryPrefix: true });

        res.redirect(302, `/${req.params.slug}.prv/events/${req.params.eventSlug}${query}`);
      }
   ),
    middlewares.agendaEventShow
 );

  app.get(
    '/:slug/events/:eventSlug',
    preMw,
    cmn.https,
    legacyAgendaSvc.mw.load('slug'),
    cmn.ifIs(
      'agenda.private',
      (req, res) => {
        const query = qs.stringify(req.query, { addQueryPrefix: true });

        res.redirect(302, `/${req.params.slug}.prv/events/${req.params.eventSlug}${query}`);
      }
   ),
    middlewares.agendaEventShow
 );

  app.get(
    '/agendas/:uid/events/:eventUid',
    preMw,
    legacyAgendaSvc.mw.load('uid'),
    legacyEventSvc.mw.load('eventUid', 'uid'),
    redirect
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
    (req, res) => res.send(req.render)
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
      middlewares.customEmbedEventShow
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
    (req, res) => res.send(req.render)
  );

  app.get(
    '/events/:eventSlug',
    preMw,
    cmn.https,
    (req, res, next) => {

      const integer = parseInt(req.params.eventSlug);

      if (Number.isInteger(integer) && ((integer + '').length === req.params.eventSlug.length)) {

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
        message: _.get(errorLabels, ['noOrigin', req.lang], 'noOrigin.en')
      });
    }
 );

  app.get(
    '/events/:eventUid',
    preMw,
    cmn.https,
    legacyEventSvc.mw.load('eventUid', 'uid'),
    (req, res, next) => {
      req.agenda = req.event.origin;
      next();
    },
    redirect
 );

};


/**
 * controllers
 */

async function agendaEventShow(req, res, next) {

  const reqParams = {};

  if (req.query.admin_nav) {

    reqParams.admin_nav = req.query.admin_nav;

  }

  const eventUrl = `/${req.agenda.slug}/events/${req.event.slug}`;

  _addLanguageLinks(req, eventUrl, reqParams);

  const member = req.user ? await members.get({
    agendaUid: req.agenda.uid,
    userUid: req.user.uid
  }) : null;

  cmn.render(req, res, 'event/show', {
    tiles: config.tiles,
    scriptParams: {
      root: config.root,
      contributor: member ? { uid: member.userUid } : null,
      agendaSlug: req.agenda.slug,
      agendaImage: req.agenda.image
        ? `${config.aws.imageBucketPath}${req.agenda.image}`
        : config.aws.defaultImagePath,
    },
    oaRoot: config.root,
    agendaId: req.agenda.id,
    private: req.agenda.private,
    adminNav: req.query.admin_nav,
    isOriginAgenda: _.get(req, 'event.origin.uid') === req.agenda.uid,
    removeRedirect: req.query.admin_nav ? base64.encode(`/${req.agenda.slug}/admin?${qs.stringify(req.query.admin_nav)}`) : null,
    redirect: cmn.makeRedirect(req),
    isCancelled: determineEventCancellationFromTitle(req.event.title),
    event: req.formatted,
    hasLocation: !!req.formatted.location?.uid,
    components: req.components,
    showRequestLocation: ![2, 3].includes(_.get(member, 'role', 0)),
    user: req.user,
    footerUid: req.formatted.uid
  });
}

function renderAgendaEmbedEvent(req, res, next) {

  cmn.renderTemplate(req, 'event/embedShow', {
    eventRender: req.render,
    scriptParams: {
      res: {
        actions: req.genUrl('agendaActionShow', { slug: req.agenda.slug })
      }
    }
  }, false, (err, render) => {

    if (err) return next(err);

    req.render = render;
    res.data = render;

    next();

  });

}


function agendaCustomEmbedEventShow(req, res) {

  _addLanguageLinks(req, `/agendas/${req.params.uid}/embeds/${req.params.embedUid}/events/${req.params.eventUid}`);

  // back link needs to

  cmn.render(req, res, 'event/embedShow', {
    event: req.formatted,
    backUri: 'customEmbedShow',
    backQuery: { uid: req.params.uid, embedUid: req.params.embedUid }
  });

}


function _appendFacebookParams(req, res, next) {

  if (!req.query.fb) return next();

  // to add 'fb' class to layout html
  req.baseData.facebook = true;

  req.baseData.scriptParams.facebook = true;

  req.baseData.scriptParams.fbAppId = config.auth.facebook.id;

  next();

}


function _addLanguageLinks(req, url, urlParams) {

  var linkedLanguages = [];

  if (!req.formatted.languages) return;

  req.formatted.languages.selection.forEach(lang => {

    linkedLanguages.push({
      label: lang,
      link: url + qs.stringify({ ...urlParams, lang }, { addQueryPrefix: true })
    });

  });

  req.formatted.languages.selection = linkedLanguages;

}

function _switchEmbedLang(req, res, next) {
  req.event.switchLanguage(req.lang);

  next();
}


/**
 * append 'back to agenda' link and event social share links to event data
 */

function _formatEmbedLinks(req, res, next) {

  req.formatted.backLink = req.genUrl('agendaEmbedShow', {
    uid: req.params.uid,
    lang: req.lang
  });


  req.formatted.locationLink = req.genUrl('agendaEmbedShow', {
    uid: req.params.uid,
    oaq: {
      location: req.event.getLocationUid()
    },
    lang: req.lang
  });

  req.formatted.googleItineraryLink = googleItineraryLink(req.event.getLatitude(), req.event.getLongitude());
  req.formatted.osmItineraryLink = OSMItineraryLink(req.event.getLatitude(), req.event.getLongitude());


  req.formatted.categoryLink = false;

  if (req.formatted.categorySlug) {

    req.formatted.categoryLink = req.genUrl('agendaEmbedShow', {
      uid: req.params.uid,
      oaq: {
        category: req.formatted.categorySlug
      }
    });

  }

  req.formatted.backLabel = getLabel('back', req.lang);

  next();

}


/**
 * append 'back to agenda' link and event social share links to event data
 */

function _formatCustomEmbedLinks(req, res, next) {

  req.formatted.backLink = req.genUrl('customEmbedShow', {
    uid: req.params.uid,
    embedUid: req.params.embedUid,
    lang: req.lang
  });

  req.formatted.locationLink = req.genUrl('customEmbedShow', {
    uid: req.params.uid,
    embedUid: req.params.embedUid,
    oaq: {
      location: req.event.getLocationUid()
    },
    lang: req.lang
  });

  req.formatted.googleItineraryLink = googleItineraryLink(req.event.getLatitude(), req.event.getLongitude());
  req.formatted.osmItineraryLink = OSMItineraryLink(req.event.getLatitude(), req.event.getLongitude());

  req.formatted.categoryLink = false;

  if (req.formatted.categorySlug) {

    req.formatted.categoryLink = req.genUrl('customEmbedShow', {
      uid: req.params.uid,
      embedUid: req.params.embedUid,
      oaq: {
        category: req.formatted.categorySlug
      },
      lang: req.lang
    });

  }

  req.formatted.backLabel = getLabel('back', req.lang);

  next();

}


function _appendEventTransferCredential(req, res, next) {

  req.baseData.hasOwnershipTransfer = false;

  req.baseData.scriptParams.hasOwnershipTransfer = false;

  req.agenda.hasCredential('eventTransfer', (err, has) => {

    req.baseData.hasOwnershipTransfer = has;

    req.baseData.scriptParams.hasOwnershipTransfer = has;

    next();

  });

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
    includeFields: ['settings', 'indexed', 'private', 'credentials']
  }, (err, agendas) => {
    const agenda = agendas.filter(a => a.uid === agendaUid).shift();

    if (err) return next(err);

    req.baseData = ih(req.baseData, {
      indexed: {
        $set: _.get(agenda, 'indexed', true) && !_.get(agenda, 'private', false)
      },
      scriptParams: {
        moderatorCanPublish: {
          $set: _.get(agenda, 'settings.contribution.canPublish', ['moderators', 'administrators']).includes('moderators')
        },
        googleAnalyticsID: {
          $set: agenda?.settings?.tracking?.googleAnalytics
        }
      },
      mailto: {
        $set: cmn.agendaMailTo(agenda)
      },
      useContributeApp: {
        $set: _.get(agenda, 'credentials.useContributeApp', false)
      },
      useDetailedStatusActions: {
        $set: !!agenda?.settings?.lab?.status
      }
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
    eventSlug: req.event.slug
  }, { protocol: 'https://' });
  req.formatted.actionLabel = getLabel('export', req.lang);

  next();
}

function wrap(fn) {
  return (req, res, next) => fn(req, res, next).catch(next);
}

function _decorateLocation(req, res, next) {

  const locationTags = _.get(req, 'formatted.location.tags', []);

  if (!locationTags.length) return next();

  const locationField = _.first(
    _.get(req, 'agendaSettings.fields', [])
      .filter(f => f.field === 'location')
 );

  if (!locationField) return next();

  try {

    const tags = _.get(locationField, 'legacy.tagSet.groups', [])
      .reduce((tags, g) => tags.concat(g.tags), []);

    req.formatted.location.tags = locationTags
      .map(t => {

        const matching = _.first(tags.filter(tag => tag.id === t.id));

        t.label = _.get(matching, ['label', req.lang]) || t.label;

        return t;

      });

  } catch (e) {

    log('error', 'failed to use schema tags for location of event %s', _.get(req, 'formatted.event.uid'), e);

  }

  next();

}

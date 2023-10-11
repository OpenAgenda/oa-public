'use strict';

const _ = require('lodash');
const qs = require('qs');

const sessions = require('@openagenda/sessions');
const utils = require('@openagenda/utils');
const validateLink = require('@openagenda/validators/link')();
const membersSvc = require('../../members');
const config = require('../../../config');
const p = require('../../../lib/promises');
const getStatusLabel = require('../../../lib/getStatusLabel');
const format = require('./format');
const components = require('./components');

const { w } = p;
const { getRoleSlug } = membersSvc.utils;

const isURL = url => {
  try {
    validateLink(url);
    return true;
  } catch (e) {
    return false;
  }
};

const flatten = (obj, preferredKey) => obj[Object.keys(obj).includes(preferredKey) ? preferredKey : Object.keys(obj).shift()];

let svc;

/**
 * load event instance and set it in req.event
 */

async function loadMissing(req) {
  if (!req.event) {
    return;
  }

  const record = await req.app.services
    .knex('event_2')
    .first(['timings', 'online_access_link', 'registration', 'conditions', 'status'])
    .where('uid', req.event.uid);

  req.event.timings = record ? (JSON.parse(record.timings) || []).map(t => ({
    start: t.begin,
    end: t.end,
  })) : [];

  req.event.onlineAccessLink = record?.online_access_link;

  req.event.ticketLink = JSON.parse(record?.registration || '[]')
    .filter(isURL)
    .pop();

  req.event.pricingInfo = flatten(JSON.parse(record?.conditions || '{}'), req.lang);

  req.event.status = record?.status === undefined ? 1 : record?.status;

  req.event.statusLabel = getStatusLabel(req.event.status, req.lang);
  req.event.isNotScheduled = req.event.status !== 1;
}

function cleanEvents(req, res, next) {
  svc.exports.cleanEvents(req.app.services, req.events, { includeEmbedded: !!req.query.include_embedded }, (err, clean) => {
    if (err) return next(err);

    req.formatted = clean;

    next();
  });
}

function layoutData(req) {
  const description = `${req.formatted.description} - ${req.formatted.dateRange} - ${req.formatted.location.name}`;

  const data = {
    metas: {
      title: utils.escape(req.formatted.title, false),
      keywords: utils.escape(req.formatted.keywords, false),
      ogSiteName: { property: 'og:site_name', content: 'OpenAgenda' },
      ogTitle: { property: 'og:title', content: utils.escape(req.formatted.title, false) },
      ogDescription: { property: 'og:description', content: utils.escape(description) },
      ogLocale: { property: 'og:locale', content: req.lang },
      'twitter:card': req.event.image ? 'summary_large_image' : 'summary',
      'twitter:title': utils.escape(req.formatted.title, false),
      'twitter:description': utils.escape(description, false),
      'twitter:domain': config.domain,
    },
    loner: !req.agenda,
  };

  if (req.agenda) {
    utils.extend(data, {
      uid: req.agenda.uid,
      slug: req.agenda.slug,
      title: req.agenda.title,
      description: req.agenda.description,
      url: req.agenda.url,
      image: req.agenda.getImage(false),
    });
  }

  if (!data.headLinks) data.headLinks = [];

  if (req.event.getLanguages && req.event.getLanguages().length > 1) {
    req.event.getLanguages().forEach(lang => {
      const href = req.agenda
        ? `${config.root}/${req.agenda.slug}/events/${req.event.slug}`
        : `${config.root}/events/${req.event.slug}`;

      data.headLinks.push({
        rel: 'alternate',
        href: `${href}${qs.stringify({ lang }, { addQueryPrefix: true })}`,
        hreflang: lang,
      });
    });
  }

  data.headLinks.push({
    rel: 'canonical',
    href: `${config.root}/events/${req.event.slug}`,
  });

  if (req.event.image) {
    utils.extend(data.metas, {
      ogImage: { property: 'og:image', content: req.event.getImage(true) },
      'twitter:image': req.event.getImage(true),
    });
  }

  data.metas.ogUrl = {
    property: 'og:url',
    content: `${config.root}${req.agenda ? `/agendas/${req.agenda.uid}` : ''}/events/${req.event.uid}?lang=${req.lang}`,
  };

  data.scriptParams = {
    uid: req.formatted.uid,
    title: utils.escape(req.formatted.title, false),
    agendaUid: req.agenda ? req.agenda.uid : false,
    agendaTitle: req.agenda ? req.agenda.title : false,
    ownerUid: req.formatted.owner.uid,
    adminAgendaUids: req.formatted.adminAgendas ? req.formatted.adminAgendas.map(a => a.uid) : [],
    hasCustomFields: (req.formatted.custom && req.formatted.custom.length) || req.formatted.hasPrivateCustomFields || !!_.get(req.formatted, 'tagGroups', []).length,
    lang: req.lang,
  };

  return data;
}

function _loadAgendaContext(v) {
  return w.promise((rs, rj) => {
    v.event.loadAgendaContext(v.req.agenda.id, err => {
      if (err) return rj(err);

      rs(v);
    });
  });
}

function _selectLanguage(v) {
  if (!v.req.query.lang) return v;

  if (v.event.hasLanguage(v.req.query.lang)) {
    v.event.switchLanguage(v.req.query.lang);
  }

  return v;
}

async function _loadUserAgendaCreds(v) {
  v.req.log.debug('loading user agenda creds');

  if (!v.req.user) {
    v.req.log.debug('user is not logged');

    return v;
  }

  const { user } = v.req;

  const member = await membersSvc.get({
    agendaUid: v.req.agenda.uid,
    userUid: user.uid,
  });

  if (member) {
    v.user.credential = getRoleSlug(member.role);
  }

  return v;
}

function _loadUserCreds(v) {
  v.user.logged = sessions.isLogged(v.req);

  return w.promise((rs, rj) => {
    sessions.isLogged(v.req).then(is => {
      if (!is) return rs(v);

      sessions.get(v.req, (err, user) => {
        v.req.user = user;

        v.event.isEditor(v.req.user.id, (_err, _is) => {
          if (err) return rj(err);

          v.user.editor = is;

          rs(v);
        });
      });
    });
  });
}

/**
 * check whether event access is restricted
 */

function _loadAccessRequired(v) {
  v.isDraft = v.event.getIsDraft();

  if (v.req.agenda && v.inAgendaContext) {
    v.event.isPublishedOn(v.req.agenda);

    v.accessRequired = !v.event.isPublishedOn(v.req.agenda);
  } else {
    v.accessRequired = v.isDraft;
  }

  return v;
}

/**
 * load event instance from request parameters
 */

function _get(paramName, fieldName, inAgendaContext) {
  const field = typeof fieldName === 'undefined' ? paramName : fieldName;

  return v => w.promise((rs, rj) => {
    const getParams = {};

    getParams[field] = v.req.params[paramName];

    if (v.req.agenda && inAgendaContext) getParams.reviewId = v.req.agenda.id;

    v.req.log.debug('getting event with params %s', JSON.stringify(getParams));

    svc.get(getParams, (err, e) => {
      if (err) return rj(err);

      if (!e) {
        v.req.log.debug('did not find event');

        return rj({ code: 404 });
      }

      v.event = e;

      rs(v);
    });
  });
}

function loadEvent(paramName, fieldName, options) {
  const params = _.extend({
    inAgendaContext: true, // if agenda is in request and event must not be loaded in agenda context, use this
  }, options || {});

  return (req, res, next) => {
    w({
      req,
      res,
      event: false,
      accessRequired: null,
      inAgendaContext: params.inAgendaContext,
      user: {
        logged: null,
        editor: null, // owner of the event or editor through admin agenda
        credential: null, // relative to agenda
      },
    })

      .then(_get(paramName, fieldName, params.inAgendaContext))

      .then(_selectLanguage)

      .then(p.ifl({ 'req.agenda': true }, _loadAgendaContext))

      .then(_loadAccessRequired)

      .then(p.ifl({ accessRequired: true }, _loadUserCreds))

      .then(p.ifl({ 'req.agenda': true, accessRequired: true }, _loadUserAgendaCreds))

      .done(async v => {
        req.event = v.event;

        await loadMissing(req);

        // event is publicly available
        if (!v.accessRequired) {
          return next();
        }

        // event is restricted and user is not logged
        if (!await v.user.logged) {
          const redirect = Buffer.from(req.originalUrl).toString('base64');

          return res.redirect(`${req.agenda ? `/${req.agenda.slug}` : ''}/signin?msg=limitedAccessEvent&redirect=${redirect}`);
        }

        // user is logged and is editor or admin or moderator
        if (v.user.editor || ['administrator', 'moderator'].includes(v.user.credential)) {
          return next();
        }

        // user is logged but does not have access
        return next({
          code: 403,
          messageCode: 'eventRestrictedAccess',
        });
      }, next);
  };
}

module.exports = eventService => {
  svc = eventService;

  return {
    load: loadEvent,
    format,
    components,
    cleanEvents,
    search: () => new Error('event middleware search is no longer available'),
    layoutData,
  };
};

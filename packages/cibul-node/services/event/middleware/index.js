import _ from 'lodash';
import qs from 'qs';
import utils from '@openagenda/utils';
import ValidateLink from '@openagenda/validators/link.js';
import registrationValidator from '@openagenda/events/iso/validators/registration.js';
import membersSvc from '../../members/index.js';
import config from '../../../config/index.js';
import getStatusLabel from '../../../lib/getStatusLabel.js';
import format from './format.js';
import components from './components.js';

const { toListOfObjects: registrationToListOfObjects } = registrationValidator;

const validateLink = ValidateLink();
const { getRoleSlug } = membersSvc.utils;

const isURL = (url) => {
  try {
    validateLink(url);
    return true;
  } catch (e) {
    return false;
  }
};

const flatten = (obj, preferredKey) =>
  obj[
    Object.keys(obj).includes(preferredKey)
      ? preferredKey
      : Object.keys(obj).shift()
  ];

let svc;

/**
 * load event instance and set it in req.event
 */

async function loadMissing(req) {
  if (!req.event) {
    return;
  }

  const legacyLocationMissing = !req.event.locations?.[0]?.uid;
  const missing = [
    'timings',
    'online_access_link',
    'registration',
    'conditions',
    'status',
  ];

  if (legacyLocationMissing) {
    missing.push('location_uid');
  }

  const record = await req.app.services
    .knex('event_2')
    .first(missing)
    .where('uid', req.event.uid);

  req.event.timings = record
    ? (JSON.parse(record.timings) || []).map((t) => ({
      start: t.begin,
      end: t.end,
    }))
    : [];

  req.event.onlineAccessLink = record?.online_access_link;
  req.event.registration = registrationToListOfObjects(
    JSON.parse(record?.registration || '[]'),
  );
  req.event.ticketLink = req.event.registration
    .map((r) => r.value)
    .filter(isURL)
    .pop();
  req.event.pricingInfo = flatten(
    JSON.parse(record?.conditions || '{}'),
    req.lang,
  );
  req.event.status = record?.status === undefined ? 1 : record?.status;
  req.event.statusLabel = getStatusLabel(req.event.status, req.lang);
  req.event.isNotScheduled = req.event.status !== 1;

  if (legacyLocationMissing && record?.location_uid) {
    const l = await req.app.services
      .knex('location')
      .first()
      .where('uid', record.location_uid);

    if (l) {
      Object.assign(req.event.locations[0], {
        id: l.id,
        uid: l.uid,
        name: l.placename,
        address: l.address,
        city: l.city,
        region: l.region,
        postalCode: l.postal_code,
        latitude: l.latitude,
        longitude: l.longitude,
        country: l.country_code,
      });
    }
  }
}

function cleanEvents(req, res, next) {
  svc.exports.cleanEvents(
    req.app.services,
    req.events,
    { includeEmbedded: !!req.query.include_embedded },
    (err, clean) => {
      if (err) return next(err);
      req.formatted = clean;
      next();
    },
  );
}

function layoutData(req) {
  const description = `${req.formatted.description} - ${req.formatted.dateRange} - ${req.formatted.location.name}`;
  const data = {
    metas: {
      title: utils.escape(req.formatted.title, false),
      keywords: utils.escape(req.formatted.keywords, false),
      ogSiteName: { property: 'og:site_name', content: 'OpenAgenda' },
      ogTitle: {
        property: 'og:title',
        content: utils.escape(req.formatted.title, false),
      },
      ogDescription: {
        property: 'og:description',
        content: utils.escape(description),
      },
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
    req.event.getLanguages().forEach((lang) => {
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
    adminAgendaUids: req.formatted.adminAgendas
      ? req.formatted.adminAgendas.map((a) => a.uid)
      : [],
    hasCustomFields:
      (req.formatted.custom && req.formatted.custom.length)
      || req.formatted.hasPrivateCustomFields
      || !!_.get(req.formatted, 'tagGroups', []).length,
    lang: req.lang,
  };

  return data;
}

async function _loadAgendaContext(v) {
  return new Promise((resolve, reject) => {
    v.event.loadAgendaContext(v.req.agenda.id, (err) => {
      if (err) return reject(err);
      resolve(v);
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

async function _loadUserCreds(v) {
  const { sessions } = v.req.app.services;
  v.user.logged = await sessions.isLogged(v.req);

  if (!v.user.logged) return v;

  const user = await sessions.get(v.req);
  v.req.user = user;
  v.user.editor = await v.event.isEditor(user.id).catch(() => false);

  return v;
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

  return async (v) => {
    const getParams = {};
    getParams[field] = v.req.params[paramName];

    if (v.req.agenda && inAgendaContext) getParams.reviewId = v.req.agenda.id;

    v.req.log.debug('getting event with params %s', JSON.stringify(getParams));

    const e = await new Promise((resolve, reject) => {
      svc.get(getParams, (err, event) => {
        if (err) return reject(err);
        if (!event) {
          v.req.log.debug('did not find event');
          // eslint-disable-next-line prefer-promise-reject-errors
          return reject({ code: 404 });
        }
        resolve(event);
      });
    });

    v.event = e;

    return v;
  };
}

function loadEvent(paramName, fieldName, options) {
  const params = _.extend(
    {
      inAgendaContext: true, // if agenda is in request and event must not be loaded in agenda context, use this
    },
    options || {},
  );

  return async (req, res, next) => {
    try {
      let v = {
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
      };

      v = await _get(paramName, fieldName, params.inAgendaContext)(v);
      v = _selectLanguage(v);
      if (v.req.agenda) {
        v = await _loadAgendaContext(v);
      }
      v = _loadAccessRequired(v);
      if (v.accessRequired) {
        v = await _loadUserCreds(v);
      }
      if (v.req.agenda && v.accessRequired) {
        v = await _loadUserAgendaCreds(v);
      }

      req.event = v.event;

      await loadMissing(req);

      // event is publicly available
      if (!v.accessRequired) {
        return next();
      }

      // event is restricted and user is not logged
      if (!v.user.logged) {
        const redirect = Buffer.from(req.originalUrl).toString('base64');
        return res.redirect(
          `${req.agenda ? `/${req.agenda.slug}` : ''}/signin?msg=limitedAccessEvent&redirect=${redirect}`,
        );
      }

      // user is logged and is editor or admin or moderator
      if (
        v.user.editor
        || ['administrator', 'moderator'].includes(v.user.credential)
      ) {
        return next();
      }

      // user is logged but does not have access
      return next({
        code: 403,
        messageCode: 'eventRestrictedAccess',
      });
    } catch (err) {
      return next(err);
    }
  };
}

export default (eventService) => {
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

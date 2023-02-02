'use strict';

const { cleanString } = require('@openagenda/utils');

const convertImage = require('./lib/convertImage');
const convertAccessibility = require('./lib/convertAccessibility');
const convertOriginAgenda = require('./lib/convertOriginAgenda');
const convertTimings = require('./lib/convertTimings');
const getLongDescriptionLinks = require('./lib/getLongDescriptionLinks');
const getLocationInfo = require('./lib/getLocationInfo');
const getFirstLastTimings = require('./lib/getFirstLastTimings');
const getTags = require('./lib/getTags');
const getCustom = require('./lib/getCustom');
const getCategory = require('./lib/getCategory');
const convertRegistration = require('./lib/convertRegistration');
const getPermalink = require('./lib/getPermalink');
const convertKeywords = require('./lib/convertKeywords');
const convertAge = require('./lib/convertAge');
const convertMember = require('./lib/convertMember');
const convertState = require('./lib/convertState');

const pick = (obj, fields) => fields.reduce(
  (carry, field) => Object.assign(carry, { [field]: obj[field] }),
  {},
);

module.exports = (agendaSettings, event) => {
  const { interfaces, admin, root } = agendaSettings;

  const legacyFormat = {
    uid: event.uid,
    slug: event.slug,
    canonicalUrl: `${root}/${agendaSettings.slug}/events/${event.slug}`,
    title: event.title,
    description: event.description ? Object.keys(event.description).reduce((carry, lang) => ({
      ...carry,
      [lang]: cleanString(event.description[lang]),
    }), {}) : {},
    longDescription: event.longDescription ? Object.keys(event.longDescription).reduce((carry, lang) => ({
      ...carry,
      [lang]: cleanString(event.longDescription[lang]),
    }), {}) : {},
    keywords: convertKeywords(event.keywords),
  };

  if (interfaces.renderHTMLFromMarkdown && legacyFormat.longDescription) {
    legacyFormat.html = Object.keys(legacyFormat.longDescription).reduce((carry, lang) => {
      carry[lang] = interfaces.renderHTMLFromMarkdown(event.links, cleanString(event.longDescription[lang]));
      return carry;
    }, {});
  }

  const {
    registration,
    registrationUrl,
  } = convertRegistration(event.registration);

  const {
    tags,
    tagGroups,
  } = getTags(agendaSettings, event);

  Object.assign(legacyFormat, {
    longDescriptionLinks: getLongDescriptionLinks(event.links),
  }, convertImage(event.image), {
    age: convertAge(event.age),
    accessibility: convertAccessibility(event.accessibility),
    updatedAt: event.updatedAt,
    createdAt: event.createdAt,
    range: event.dateRange,
    location: event.location ? Object.assign(
      pick(
        event.location,
        [
          'uid',
          'name',
          'slug',
          'address',
          'image',
          'imageCredits',
          'postalCode',
          'city',
          'district',
          'department',
          'region',
          'latitude',
          'longitude',
          'description',
          'access',
        ],
      ),
      {
        countryCode: event.location.countryCode ? event.location.countryCode.toLowerCase() : undefined,
      },
      pick(
        event.location,
        [
          'website',
          'email',
          'links',
          'insee',
          'phone',
          'tags',
          'timezone',
          'updatedAt',
          'extId',
        ],
      ),
      {
        country: event.country,
      },
    ) : null,
    attendanceMode: event.attendanceMode,
    onlineAccessLink: event.onlineAccessLink,
    status: event.status,
    imageCredits: event?.imageCredits ? event?.imageCredits : null,
    origin: convertOriginAgenda(event),
    conditions: event.conditions,
    registrationUrl,
  }, event.location ? getLocationInfo(event.location) : {}, {
    timings: convertTimings(event.timings, event.timezone),
    registration,
  }, getFirstLastTimings(event.timings), {
    permalink: getPermalink(agendaSettings, event),
    featured: Number(event.featured),
    custom: getCustom(agendaSettings, event),
    contributor: convertMember(admin, event),
    category: getCategory(agendaSettings, event),
    tags,
    tagGroups,
    linkedEvents: [],
  });

  if (admin) {
    legacyFormat.state = convertState(event.state);
  }

  for (const field in legacyFormat) {
    if (typeof legacyFormat[field] === 'object'
    && legacyFormat[field] !== null
    && Object.keys(legacyFormat[field]).length === 0
    && !['longDescriptionLinks', 'accessibility', 'longDescription', 'html', 'registration', 'tags', 'tagGroups', 'linkedEvents'].includes(field)
    ) {
      legacyFormat[field] = null;
    }
  }

  return legacyFormat;
};

'use strict';

const convertImage = require('./lib/convertImage');
const convertAccessibility = require('./lib/convertAccessibility');
const convertOriginAgenda = require('./lib/convertOriginAgenda');
const convertTimings = require('./lib/convertTimings');
const getLongDescriptionLinks = require('./lib/getLongDescriptionLinks');
const getLocationInfo = require('./lib/getLocationInfo');
const getfirstLastTimings = require('./lib/firstLastTimings');
const getTags = require('./lib/getTags');
const getCustom = require('./lib/getCustom');
const getCategory = require('./lib/getCategory');
const convertRegistration = require('./lib/convertRegistration');
const getPermalink = require('./lib/getPermalink');
const convertKeywords = require('./lib/convertKeywords');
const convertAge = require('./lib/convertAge');
const convertMember = require('./lib/convertMember');
const convertState = require('./lib/convertState');

module.exports = (agendaSettings, event) => {
  const { interfaces, admin } = agendaSettings;

  const transformedEvent = [
    'uid',
    'slug',
    'title',
    'description',
    'longDescription',
    'createdAt',
    'updatedAt',
    'attendanceMode',
    'onlineAccessLink',
    'status',
    'conditions',
  ].reduce((carry, field) => {
    carry[field] = event[field];
    return carry;
  }, {});

  for (const field in transformedEvent) {
    if (typeof transformedEvent[field] === 'object'
    && transformedEvent[field] !== null
    && Object.keys(transformedEvent[field]).length === 0
    ) {
      transformedEvent[field] = null;
    }
  }

  const tags = getTags(agendaSettings, event);
  const imageFormats = convertImage(event.image);
  const locationDetails = getLocationInfo(event.location);
  const firstLastTimings = getfirstLastTimings(event.timings);
  const registration = convertRegistration(event.registration);

  Object.assign(transformedEvent, {
    canonicalUrl: `https://openagenda.com/${agendaSettings.slug}/events/${event.slug}`,
    range: event.dateRange,
    featured: Number(event.featured),
    imageCredits: event?.imageCredits ? event?.imageCredits : null,
    linkedEvents: [],
    location: {
      ...event.location,
      countryCode: event.location.countryCode ? event.location.countryCode.toLowerCase() : undefined,
      country: event.country
    },
    accessibility: convertAccessibility(event.accessibility),
    origin: convertOriginAgenda(event),
    timings: convertTimings(event.timings, event.timezone),
    permalink: getPermalink(agendaSettings, event),
    longDescriptionLinks: getLongDescriptionLinks(event.links),
    contributor: convertMember(admin, event.member),
    age: convertAge(event.age),
    keywords: convertKeywords(event.keywords),
    custom: getCustom(agendaSettings, event),
    category: getCategory(agendaSettings, event),
    ...imageFormats,
    ...locationDetails,
    ...firstLastTimings,
    ...registration,
    ...tags
  });

  if (interfaces.renderHTMLFromMarkdown && transformedEvent.longDescription) {
    transformedEvent.html = Object.keys(transformedEvent.longDescription).reduce((carry, curr) => {
      carry[curr] = interfaces.renderHTMLFromMarkdown(event.links, event.longDescription[curr]);
      return carry;
    }, {});
  }

  if (admin) {
    transformedEvent.state = convertState(event.state);
  }

  return transformedEvent;
};

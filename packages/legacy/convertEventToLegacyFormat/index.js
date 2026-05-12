import { cleanString } from '@openagenda/utils';
import convertImage from './lib/convertImage.js';
import convertAccessibility from './lib/convertAccessibility.js';
import convertOriginAgenda from './lib/convertOriginAgenda.js';
import convertTimings from './lib/convertTimings.js';
import getLongDescriptionLinks from './lib/getLongDescriptionLinks.js';
import getLocationInfo from './lib/getLocationInfo.js';
import getFirstLastTimings from './lib/getFirstLastTimings.js';
import getTags from './lib/getTags.js';
import getCustom from './lib/getCustom.js';
import getCategory from './lib/getCategory.js';
import convertRegistration from './lib/convertRegistration.js';
import getPermalink from './lib/getPermalink.js';
import convertKeywords from './lib/convertKeywords.js';
import convertAge from './lib/convertAge.js';
import convertMember from './lib/convertMember.js';
import convertState from './lib/convertState.js';
import assignLocationTags from './lib/assignLocationTags.js';

const pick = (obj, fields) =>
  fields.reduce(
    (carry, field) => Object.assign(carry, { [field]: obj[field] }),
    {},
  );

export default (agendaSettings, event, options = {}) => {
  const { interfaces, admin, root } = agendaSettings;

  const { locationTagLang } = options;

  const legacyFormat = {
    uid: event.uid,
    slug: event.slug,
    canonicalUrl: `${root}/${agendaSettings.slug}/events/${event.uid}_${event.slug}`,
    title: event.title,
    description: event.description
      ? Object.keys(event.description).reduce(
        (carry, lang) => ({
          ...carry,
          [lang]: cleanString(event.description[lang]),
        }),
        {},
      )
      : {},
    longDescription: event.longDescription
      ? Object.keys(event.longDescription).reduce(
        (carry, lang) => ({
          ...carry,
          [lang]: cleanString(event.longDescription[lang]),
        }),
        {},
      )
      : {},
    keywords: convertKeywords(event.keywords),
  };

  if (interfaces?.renderHTMLFromMarkdown && legacyFormat.longDescription) {
    legacyFormat.html = Object.keys(legacyFormat.longDescription).reduce(
      (carry, lang) => {
        carry[lang] = interfaces.renderHTMLFromMarkdown(
          event.links,
          cleanString(event.longDescription[lang]),
        );
        return carry;
      },
      {},
    );
  }

  const { registration, registrationUrl } = convertRegistration(
    event.registration,
  );

  const { tags, tagGroups } = getTags(agendaSettings, event);

  Object.assign(
    legacyFormat,
    {
      longDescriptionLinks: getLongDescriptionLinks(event.links),
    },
    convertImage(event.image),
    {
      age: convertAge(event.age),
      accessibility: convertAccessibility(event.accessibility),
      updatedAt: event.updatedAt,
      createdAt: event.createdAt,
      range: event.dateRange,
      location: event.location
        ? Object.assign(
          pick(event.location, [
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
          ]),
          {
            countryCode: event.location.countryCode
              ? event.location.countryCode.toLowerCase()
              : undefined,
          },
          pick(event.location, [
            'website',
            'email',
            'links',
            'insee',
            'phone',
            'tags',
            'timezone',
            'updatedAt',
            'extId',
          ]),
          assignLocationTags(event.location, locationTagLang),
          {
            country: event.country,
          },
        )
        : null,
      attendanceMode: event.attendanceMode,
      onlineAccessLink: event.onlineAccessLink,
      status: event.status,
      imageCredits: event?.imageCredits ? event?.imageCredits : null,
      origin: convertOriginAgenda(event),
      conditions: event.conditions,
      registrationUrl,
    },
    event.location ? getLocationInfo(event.location) : {},
    {
      timings: convertTimings(event.timings, event.timezone),
      registration,
    },
    getFirstLastTimings(event.timings),
    {
      permalink: getPermalink(agendaSettings, event),
      featured: Number(event.featured),
      custom: getCustom({ agendaSettings, admin }, event),
      contributor: convertMember(admin, event),
      category: getCategory(agendaSettings, event),
      tags,
      tagGroups,
      linkedEvents: [],
    },
  );

  if (admin) {
    legacyFormat.state = convertState(event.state);
  }

  for (const field in legacyFormat) {
    if (
      typeof legacyFormat[field] === 'object'
      && legacyFormat[field] !== null
      && Object.keys(legacyFormat[field]).length === 0
      && ![
        'longDescriptionLinks',
        'accessibility',
        'longDescription',
        'html',
        'registration',
        'tags',
        'tagGroups',
        'linkedEvents',
      ].includes(field)
    ) {
      legacyFormat[field] = null;
    }
  }

  return legacyFormat;
};

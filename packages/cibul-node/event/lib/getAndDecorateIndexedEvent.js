'use strict';

const { produce } = require('immer');
const languages = require('languages');
const { formatInTimeZone } = require('date-fns-tz');
const registrationLabels = require('@openagenda/labels/event/registration');
const makeLabelGetter = require('@openagenda/labels');
const { toEventSchema } = require('@openagenda/sdk-js');
const log = require('@openagenda/logs')('event/lib/getAndDecorateIndexedEvent');

const getLabel = makeLabelGetter(registrationLabels);

const {
  utils: agendaPortalUtils,
} = require('@openagenda/agenda-portal');

function pickPreferredLang(value, lang) {
  if (!value) {
    return null;
  }
  const choice = value?.[lang] !== undefined ? lang : Object.keys(value ?? {}).shift();

  return value[choice];
}

module.exports = async function getAndDecorateIndexedEvent(services, {
  eventSlug,
  eventUid,
  agendaUid,
  userUid,
  lang,
  originalUrl,
  detailed = false,
}) {
  const {
    core,
  } = services;

  const { root } = core.getConfig();

  const eventUrl = `${root}${originalUrl.split('?').shift()}?lang=${lang}`;

  const identifier = {};

  if (eventSlug) {
    identifier.slug = eventSlug;
  }

  if (eventUid) {
    identifier.uid = eventUid;
  }

  const event = await core.agendas(agendaUid)
    .events
    .search.get(identifier, {
      userUid,
      detailed,
      longDescriptionFormat: 'HTMLWithEmbeds',
      includeLabels: true,
      includeLocationImagePath: true,
      includeImageTimestamps: true,
    });

  if (!event) {
    return null;
  }

  return produce(event, draft => {
    if (detailed) {
      // timings component data structure
      try {
        draft.months = agendaPortalUtils.spreadTimingsPerMonthPerDay(
          event.timings.map(t => agendaPortalUtils.detailedTiming({ event }, t, lang)),
          event.timezone,
          lang,
        );
      } catch (e) {
        const message = `months of event ${event.slug} could not be extracted`;
        log('error', message);
        throw new Error(message);
      }

      draft.isUpcoming = new Date(event.timings[event.timings.length - 1].begin) > new Date();

      draft.availableAccessibilities = Object.keys(event.accessibility).filter(key => !!event.accessibility[key]);

      draft.JSONLD = JSON.stringify(toEventSchema(event, {
        locale: lang,
        formatDate: (date, tz = 'Europe/Paris') => formatInTimeZone(date, tz, 'yyyy-MM-dd\'T\'HH:mm:ssXXX'),
        url: `${root}/agendas/${agendaUid}/events/${event.uid}`,
      }));
    }

    // flatten main multilingual fields
    ['title', 'description', 'keywords', 'conditions', 'longDescription', 'dateRange'].forEach(field => {
      draft[field] = pickPreferredLang(event[field], lang);
    });

    if (draft.location) {
      const {
        latitude,
        longitude,
      } = event.location;

      ['description', 'access'].forEach(field => {
        draft.location[field] = pickPreferredLang(event.location[field], lang);
      });
      draft.location.googleItineraryLink = `https://www.google.com/maps/dir//${latitude},${longitude}/@${latitude},${longitude},17z`;
      draft.location.OSMItineraryLink = `https://www.openstreetmap.org/directions?to=${latitude}%2C${longitude}`;
    }

    if (draft.registration?.length) {
      draft.registration.forEach(r => {
        Object.assign(r, {
          phone: {
            icon: 'fa-phone',
            prefix: 'tel:',
          },
          link: {
            icon: 'fa-link',
            prefix: '',
            label: getLabel('registerBook', lang),
          },
          email: {
            icon: 'fa-envelope',
            prefix: 'mailto:',
          },
        }[r.type]);
      });
    }

    const permalink = `${root}/agendas/${agendaUid}/events/${event.uid}`;

    draft.languages = Object.keys(event.title).map(code => ({
      code,
      label: languages.getLanguageInfo(code).nativeName,
      link: `${permalink}?lang=${code}`,
    }));

    draft.permalink = permalink;

    draft.facebookShare = `https://www.facebook.com/sharer.php?u=${encodeURIComponent(eventUrl)}`;
    draft.twitterShare = `https://twitter.com/share?url=${encodeURIComponent(eventUrl)}&text=${encodeURIComponent(draft.title)}`;
    draft.linkedInShare = `http://www.linkedin.com/shareArticle?url=${encodeURIComponent(eventUrl)}&title=${encodeURIComponent(draft.title)}&summary=${encodeURIComponent(`${draft.description} - ${eventUrl}`)}&source=${encodeURIComponent(root)}`;
  });
};

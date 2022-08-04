'use strict';

const { produce } = require('immer');
const languages = require('languages');
const registrationLabels = require('@openagenda/labels/event/registration');
const makeLabelGetter = require('@openagenda/labels');

const getLabel = makeLabelGetter(registrationLabels);

const {
  utils: agendaPortalUtils
} = require('@openagenda/agenda-portal');

function pickPreferredLang(value, lang) {
  if (!value) {
    return null;
  }
  const choice = value?.[lang] !== undefined ? lang : Object.keys(value ?? {}).shift();

  return value[choice];
}

module.exports = async function getAndDecoratedIndexedEvent(services, {
  eventSlug,
  agendaUid,
  userUid,
  lang,
  root,
  originalUrl
}) {
  const {
    core
  } = services;

  const eventUrl = `${root}${originalUrl.split('?').shift()}?lang=${lang}`;

  const result = await core.agendas(agendaUid)
    .events
    .search({
      slug: eventSlug,
      state: null
    }, { size: 1 }, {
      userUid,
      detailed: true,
      longDescriptionFormat: 'HTMLWithEmbeds',
      includeLabels: true,
      includeLocationImagePath: true
    });

  const event = result.events.pop();

  if (!event) {
    return null;
  }

  return produce(event, draft => {
    // timings component data structure
    draft.months = agendaPortalUtils.spreadTimingsPerMonthPerDay(
      event.timings.map(t => agendaPortalUtils.detailedTiming({ event }, t, lang)),
      event.timezone,
      lang
    );

    // flatten main multilingual fields
    ['title', 'description', 'keywords', 'conditions', 'longDescription', 'dateRange'].forEach(field => {
      draft[field] = pickPreferredLang(event[field], lang);
    });

    if (draft.location) {
      const {
        latitude,
        longitude
      } = event.location;

      ['description', 'access'].forEach(field => {
        draft.location[field] = pickPreferredLang(event.location[field], lang);
      });
      draft.location.googleItineraryLink = `https://www.google.com/maps/dir//${latitude},${longitude}/@${latitude},${longitude},17z`;
      draft.location.OSMItineraryLink = `https://www.openstreetmap.org/directions?to=${latitude}%2C${longitude}`;
    }

    if (draft.registration?.length) {
      draft.registration.forEach(r => {
        Object.assign(r, ({
          phone: {
            icon: 'fa-phone',
            prefix: 'tel:'
          },
          link: {
            icon: 'fa-link',
            prefix: '',
            label: getLabel('registerBook', lang)
          },
          email: {
            icon: 'fa-envelope',
            prefix: 'mailto:'
          }
        })[r.type]);
      });
    }

    const permalink = `${root}/agendas/${agendaUid}/events/${event.uid}`;

    draft.languages = Object.keys(event.title).map(code => ({
      code,
      label: languages.getLanguageInfo(code).nativeName,
      link: `${permalink}?lang=${code}`
    }));

    draft.permalink = permalink;

    draft.isUpcoming = new Date(event.timings[event.timings.length - 1].begin) > new Date();

    draft.availableAccessibilities = Object.keys(event.accessibility).filter(key => !!event.accessibility[key]);

    draft.facebookShare = `https://www.facebook.com/sharer.php?u=${encodeURIComponent(eventUrl)}`;
    draft.twitterShare = `https://twitter.com/share?url=${encodeURIComponent(eventUrl)}&text=${encodeURIComponent(draft.title)}`;
    draft.linkedInShare = `http://www.linkedin.com/shareArticle?url=${encodeURIComponent(eventUrl)}&title=${encodeURIComponent(draft.title)}&summary=${encodeURIComponent(`${draft.description} - ${eventUrl}`)}&source=${encodeURIComponent(root)}`;

    draft.JSONLD = agendaPortalUtils.getEventSchemaJSONLD(event, {
      defaultTimezone: 'Europe/Paris'
    });
  });
};

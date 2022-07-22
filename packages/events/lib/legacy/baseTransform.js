'use strict';

const moment = require('moment-timezone');

const getEventLanguages = event => [
  'title',
  'description',
  'longDescription',
  'keywords',
  'conditions'
].reduce((languages, field) => languages.concat(
  Object.keys(event[field] || {}).filter(lang => !languages.includes(lang))
), []);

module.exports = (event, options = {}) => {
  const {
    locationId,
    userId
  } = {
    locationId: null,
    userId: null,
    ...options
  };

  const languages = getEventLanguages(event);
  const timezone = event.timezone || 'Europe/Paris';

  const legacyEvent = {
    uid: event.uid,
    slug: event.slug,
    image: event.image?.filename || null,
    image_credits: event.imageCredits ?? null,
    origin_uid: event.agendaUid,
    age_min: event.age?.min || null,
    age_max: event.age?.max || null,
    accessibility:  event.accessibility ? JSON.stringify(
      Object.keys(event.accessibility).filter(code => event.accessibility[code])
    ) : null,
    is_published: true,
    is_new: false,
    updated_at: new Date(),
    store: JSON.stringify({
      attendanceMode: event.attendanceMode,
      onlineAccessLink: event.onlineAccessLink,
      images: event.image,
      links: (event.links || []).map(({ link, data }) => ({
        link,
        code: data?.html
      }))
    })
  };

  if (userId !== null) {
    legacyEvent.owner_id = userId;
  }

  return {
    event: legacyEvent,
    event_translation: languages.map(lang => ({
      lang,
      title: event.title?.[lang] || '',
      description: event.description?.[lang] || '',
      free_text: event.longDescription?.[lang] || '',
      tags: (event.keywords?.[lang] || []).join(', ')
    })),
    event_location: {
      location_id: locationId,
      ticket_link: event.registration ? event.registration.join(', ') : null,
      updated_at: new Date()
    },
    event_location_translation: languages.map(lang => ({
      lang,
      pricing_info: event.conditions?.[lang] || ''
    })),
    occurrence: event.timings ? event.timings.map(t => ({
      date: moment.tz(t.begin, timezone).locale('en').format('YYYY-MM-DD'),
      time_start: moment.tz(t.begin, timezone).locale('en').format('HH:mm'),
      time_end: moment.tz(t.end, timezone).locale('en').format('HH:mm'),
      location_id: locationId,
      created_at: new Date(),
      updated_at: new Date()
    })) : null
  }
}
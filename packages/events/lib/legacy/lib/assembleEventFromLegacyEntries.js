'use strict';

const _ = require('lodash');
const moment = require('moment-timezone');

const convertOccurrenceValue = (date, time, timezone = 'Europe/Paris') => moment.tz(
  `${moment(date).locale('en').format('YYYY-MM-DD')}T${time}`,
  timezone
).locale('en').toISOString(true);

module.exports = entries => {
  const event = entries.eventTranslations.map(({ lang, title, description, tags, free_text }) => ({
    title,
    description,
    keywords: (tags || '').split(',').map(t => t.trim()),
    longDescription: free_text,
    lang
  })).reduce(({ title, description, longDescription, keywords }, entry) => ({
    title: { ...title, [entry.lang]: entry.title },
    description: { ...description, [entry.lang]: entry.description },
    longDescription: { ...longDescription, [entry.lang]: entry.longDescription },
    keywords: { ...keywords, [entry.lang]: entry.keywords }
  }), {});

  event.locationUid = entries.location?.uid;
  event.timezone = entries.location?.timezone;

  event.registration = (entries.eventLocation?.['ticket_link'] || '').split(',').map(r => r.trim());

  event.conditions = entries.eventLocationTranslations.reduce((c, { lang, pricing_info }) => ({
    ...c,
    [lang]: pricing_info
  }), {});

  event.timings = entries.occurrences.map(o => ({
    begin: convertOccurrenceValue(o.date, o.time_start, event.timezone),
    end: convertOccurrenceValue(o.date, o.time_end, event.timezone)
  }));

  if (entries.event.accessibility) {
    try {
      event.accessibility = JSON.parse(entries.event.accessibility || '[]')
        .filter(code => code !== 'sl')
        .reduce((carried, code) => ({
          ...carried,
          [code]: true
        }), {
          ii: false,
          mi: false,
          pi: false,
          hi: false,
          vi: false
        });
    } catch (e) {
      // meh
    }
  }

  try {
    event.links = JSON.parse(entries.event.store).links
      .filter(link => link.code)
      .map(({ link, code }) => ({
        type: 'oembed',
        link,
        data: {
          html: code,
          url: link
        }
      }));
  } catch (e) {
    // meh
  }

  if (entries.event.image) {
    event.image = {
      filename: entries.event.image,
      credits: entries.event?.['image_credits'] || '',
      variants: [{
        type: 'full',
        filename: `evf${entries.event.image}`
      }, {
        type: 'thumbnail',
        filename: `evtb${entries.event.image}`
      }]
    };
  }

  [
    'uid', 'slug',
    ['file_key', 'fileKey'],
    ['origin_uid', 'agendaUid'],
    ['age_min', 'age.min'],
    ['age_max', 'age.max']
  ].map(v => (Array.isArray(v) ? v : [v, v])).forEach(([from, to]) => {
    _.set(event, to, entries?.event?.[from] || null);
  });

  return event;
}
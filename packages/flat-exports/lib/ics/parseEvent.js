'use strict';

const moment = require('moment');
const getLabel = require('@openagenda/labels')(require('@openagenda/labels/exports'));
const { getLocaleValue } = require('@openagenda/intl');
const esc = require('./escape');
const foldLine = require('./foldLine');

function defaultGenUrl(e) {
  return `https://openagenda.com/events/${e.slug}`;
}

function getDescription(attributes, lang) {
  return [attributes.description, attributes.url]
    .join(` - ${getLabel('seeMore', lang)}: `);
}

function formatDate(date) {
  return moment.utc(date).format('YYYYMMDDTHHmm00[Z]');
}

module.exports = ({ lang, genUrl }, event) => {
  const url = genUrl || defaultGenUrl;

  const attributes = {
    title: esc(getLocaleValue(event.title, lang)),
    description: esc(getLocaleValue(event.description, lang)),
    url: esc(url(event)),
    location: esc([event.location?.name, event.location?.address].filter(Boolean).join(' - ')),
    geo: event.location?.latitude && event.location?.longitude
      ? `${event.location?.latitude};${event.location?.longitude}`
      : '',
    organizer: esc(event.contributor?.name || 'OA'),
    timezone: esc(event.timezone),
    // lastModified: event.updatedAt,
  };

  let ics = '';
  ics += 'BEGIN:VEVENT\r\n';

  for (const timing of event.timings) {
    const begin = formatDate(timing.begin);
    const end = formatDate(timing.end);
    const uid = [event.agenda?.uid || null, event.uid, begin].filter(Boolean).join('//');

    ics += `UID:${uid}\r\n`;
    ics += `DTSTART:${begin}\r\n`;
    ics += `DTEND:${end}\r\n`;
  }

  ics += `TZID:${attributes.timezone}\r\n`;
  ics += `${foldLine(`SUMMARY:${attributes.title}`)}\r\n`;

  ics += `${foldLine(`DESCRIPTION:${getDescription(attributes, lang)}`)}\r\n`;
  ics += attributes.location.length ? `${foldLine(`LOCATION:${attributes.location}`)}\r\n` : '';
  ics += attributes.geo.length ? `${foldLine(`GEO:${attributes.geo}`)}\r\n` : '';
  ics += `${foldLine(`ORGANIZER:${attributes.organizer}`)}\r\n`;
  ics += 'STATUS:CONFIRMED\r\n';
  ics += `DTSTAMP:${formatDate()}\r\n`;
  ics += 'END:VEVENT\r\n';

  return ics;
};

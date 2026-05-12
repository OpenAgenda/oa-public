import moment from 'moment';
import makeLabelGetter from '@openagenda/labels';
import labels from '@openagenda/labels/exports/index.js';
import { getLocaleValue } from '@openagenda/intl';
import esc from './escape.js';
import foldLine from './foldLine.js';

const getLabel = makeLabelGetter(labels);

function defaultGenUrl(e) {
  return `https://openagenda.com/events/${e.uid}`;
}

function getDescription(attributes, lang) {
  return [attributes.description, attributes.url].join(
    ` - ${getLabel('seeMore', lang)}: `,
  );
}

function formatDate(date) {
  return moment.utc(date).format('YYYYMMDDTHHmm00[Z]');
}

export default ({ lang, genUrl }, event) => {
  const url = genUrl || defaultGenUrl;

  const attributes = {
    title: esc(getLocaleValue(event.title, lang)),
    description: esc(getLocaleValue(event.description, lang)),
    url: esc(url(event)),
    location: esc(
      [event.location?.name, event.location?.address]
        .filter(Boolean)
        .join(' - '),
    ),
    geo:
      event.location?.latitude && event.location?.longitude
        ? `${event.location?.latitude};${event.location?.longitude}`
        : '',
    organizer: esc(event.contributor?.name || 'OA'),
    timezone: esc(event.timezone),
  };

  const ics = [];

  for (const timing of event.timings) {
    const begin = formatDate(timing.begin);
    [
      'BEGIN:VEVENT',
      `UID:${[event.agenda?.uid || null, event.uid, begin].filter(Boolean).join('//')}`,
      `DTSTART:${begin}`,
      `DTEND:${formatDate(timing.end)}`,
      `TZID:${attributes.timezone}`,
      `${foldLine(`SUMMARY:${attributes.title}`)}`,
      `${foldLine(`DESCRIPTION:${getDescription(attributes, lang)}`)}`,
      attributes.location.length
        ? `${foldLine(`LOCATION:${attributes.location}`)}`
        : '',
      attributes.geo.length ? `${foldLine(`GEO:${attributes.geo}`)}` : '',
      `${foldLine(`ORGANIZER:${attributes.organizer}`)}`,
      'STATUS:CONFIRMED',
      `DTSTAMP:${formatDate()}`,
      'END:VEVENT',
    ].forEach((line) => ics.push(line));
  }

  return `${ics.join('\r\n')}\r\n`;
};

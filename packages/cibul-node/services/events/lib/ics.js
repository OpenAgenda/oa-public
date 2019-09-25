'use strict';

const moment = require('moment');
const getLabel = require('@openagenda/labels')(require('@openagenda/labels/exports'));
const config = require('../../../config');
const getLocaleValue = require('./getLocaleValue');

function espaceIcsValue(txt) {
  return txt
    .replace(/\\/gm, '\\\\')
    .replace(/\r?\n/gm, '\\n')
    .replace(/;/gm, '\\;')
    .replace(/,/gm, '\\,');
}

function formatIcsDate(d, format = 'YYYYMMDDTHHmm00') {
  const date = moment(d);

  return date.format(format) + 'Z';
}

function formatIcsText(str) {
  let result = str.substring(0, 75);
  let strLeft = str.substring(75);

  while (strLeft.length > 0) {
    result += `\n ${strLeft.substring(0, 74)}`;
    strLeft = strLeft.substring(74);
  }

  return result;
}

function icsHead(agenda, lang) {
  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//' + espaceIcsValue(agenda.title) + '//agenda::' + lang,
    'METHOD:PUBLISH',
    'X-WR-CALNAME:' + espaceIcsValue(agenda.title),
    'X-WR-CALDESC:' + espaceIcsValue(agenda.description),
    'X-WR-RELCALID:' + agenda.uid,
  ].join('\n');
}

function icsBody(agenda, event, lang, timingIndex = -1) {
  const url = `${config.root}/${agenda.slug}/events/${event.slug}`;
  const description = /*truncateWithEllipses(*/getLocaleValue(event.description, lang)/*, 30)*/;
  const parsedTimingIndex = parseInt(timingIndex, 10);
  const usedTimings = parsedTimingIndex === -1
    ? event.timings
    : [event.timings[parsedTimingIndex]];
  const now = new Date();

  const repeatedParts = [
    'DTSTAMP:' + formatIcsDate(now),
    'TZID:' + event.timezone.replace('/', '-'),
    formatIcsText('SUMMARY:' + espaceIcsValue(getLocaleValue(event.title, lang))),
    formatIcsText('DESCRIPTION:' + espaceIcsValue(description) + ' ' + getLabel('seeMore', lang) + ': ' + url),
    'STATUS:CONFIRMED',
    formatIcsText('LOCATION:' + espaceIcsValue(event.location.name + ' - ' + event.location.address)),
    'GEO:' + event.location.latitude + ';' + event.location.longitude,
    formatIcsText('URL:' + url),
    'LAST-MODIFIED:' + formatIcsDate(event.updatedAt)
  ];

  return usedTimings
  // .filter(t => (new Date(t.begin) >= now))
    .filter((t, i) => (i < 10))
    .map(timing => [
      'BEGIN:VEVENT',
      'UID:' + agenda.uid + '//' + event.uid + '//' + formatIcsDate(timing.begin, 'YYYY-MM-DD//HH:mm:00'),
      'DTSTART:' + formatIcsDate(timing.begin),
      'DTEND:' + formatIcsDate(timing.end),
      ...repeatedParts,
      'ORGANIZER:OA',
      'END:VEVENT'
    ])
    .flat()
    .join('\n');
}

module.exports = (agenda, event, lang, timingIndex) => {
  const head = agenda ? `${icsHead(agenda, lang)}\n` : '';
  const body = icsBody(agenda, event, lang, timingIndex);
  const end = agenda ? '\nEND:VCALENDAR' : '';

  return `${head}${body}${end}`;
};

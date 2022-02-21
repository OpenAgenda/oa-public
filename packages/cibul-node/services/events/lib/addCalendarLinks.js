'use strict';

const { getLocaleValue } = require('@openagenda/react-shared');
const moment = require('moment-timezone');

function _linkifyTime(time) {
  return JSON.stringify(time).replace(/00\.0|:|-|"/g, '');
}

module.exports = function addCalendarLinks({ root }, event, eventUrl, agenda, lang) {
  if (!event.timings) {
    throw new Error('timings is not defined');
  }

  event.timings.forEach((timing, i) => {
    const eventTitle = getLocaleValue(event.title, lang)
    const eventDescription = getLocaleValue(event.description, lang)

    timing.calendarLinks = {
      google: [
        'https://www.google.com/calendar/event?action=TEMPLATE',
        '&text=', encodeURIComponent(eventTitle),
        '&dates=', _linkifyTime(timing.begin), '/', _linkifyTime(timing.end),
        '&sprop=website:', eventUrl,
        '&details=', encodeURIComponent(eventDescription + ' - ' + eventUrl),
      ].concat(event.location ? ['&location=', encodeURIComponent(event.location.name + ' - ' + event.location.address)] : []).join(''),
      yahoo: [
        'http://calendar.yahoo.com/?v=60',
        '&TITLE=', encodeURIComponent(eventTitle),
        '&ST=', _linkifyTime(timing.begin),
        '&DUR=', (timing.end - timing.begin) / (1000 * 60 * 60),
        '&DESC=', encodeURIComponent(eventDescription + ' - ' + eventUrl),
        '&URL=', eventUrl
      ].concat(event.location ? ['&in_loc=', encodeURIComponent(event.location.name + ' - ' + event.location.address)] : []).join(''),
      live: [
        'https://outlook.live.com/calendar/0/deeplink/compose?rru=addevent',
        '&subject=', encodeURIComponent(eventTitle),
        '&startdt=', moment.tz(timing.begin, event.timezone).locale(lang).utc().format(),
        '&enddt=', moment.tz(timing.end, event.timezone).locale(lang).utc().format(),
        '&body=', encodeURIComponent(eventDescription + ' - ' + eventUrl)
      ].concat(event.location ? ['&location=', encodeURIComponent(event.location.name + ' - ' + event.location.address)] : []).join(''),
    };

    if (agenda) {
      timing.calendarLinks.ics = `${root}/${agenda.slug}/events/${event.slug}/ics?timing=${i}&dl=1`;
    }
  });
};

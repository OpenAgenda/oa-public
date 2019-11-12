'use strict';

const config = require( '../../../config' );
const getLocaleValue = require('./getLocaleValue');


function _linkifyTime( time ) {
  return JSON.stringify( time ).replace( /00\.0|:|-|"/g, '' );
}

module.exports = function addCalendarLinks(event, eventUrl, agenda, lang) {
  event.timings.forEach( ( timing, i ) => {
    const eventTitle = getLocaleValue(event.title, lang)
    const eventDescription = getLocaleValue(event.description, lang)

    timing.calendarLinks = {
      google: [
        'https://www.google.com/calendar/event?action=TEMPLATE',
        '&text=', encodeURIComponent( eventTitle ),
        '&dates=', _linkifyTime( timing.begin ), '/', _linkifyTime( timing.end ),
        '&sprop=website:', eventUrl,
        '&details=', encodeURIComponent( eventDescription + ' - ' + eventUrl ),
        '&location=', encodeURIComponent( event.location.name + ' - ' + event.location.address )
      ].join(''),
      yahoo: [
        'http://calendar.yahoo.com/?v=60',
        '&TITLE=', encodeURIComponent( eventTitle ),
        '&ST=', _linkifyTime( timing.begin ),
        '&DUR=', ( timing.end - timing.begin ) / ( 1000 * 60 * 60 ),
        '&in_loc=', encodeURIComponent( event.location.name + ' - ' + event.location.address ),
        '&DESC=', encodeURIComponent( eventDescription + ' - ' + eventUrl ),
        '&URL=', eventUrl
      ].join(''),
      live: [
        'http://calendar.live.com/calendar/calendar.aspx?rru=addevent',
        '&summary=', encodeURIComponent( eventTitle ),
        '&location=', encodeURIComponent( event.location.name + ' - ' + event.location.address ),
        '&dtstart=', _linkifyTime( timing.begin ),
        '&dtend=', _linkifyTime( timing.end ),
        '&description=', encodeURIComponent( eventDescription + ' - ' + eventUrl )
      ].join( '' )
    };

    if ( agenda ) {
      timing.calendarLinks.ics = `${config.root}/${agenda.slug}/events/${event.slug}/ics?timing=${i}&dl=1`;
    }
  });
}

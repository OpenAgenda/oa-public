"use strict";

var log = require( '../../lib/logger' )( 'event share service' );

module.exports = {
  addCalendarLinks: addCalendarLinks,
  getSocialLinks: getSocialLinks
}


function getSocialLinks( event, eventUrl ) {

  // this generates and loads links in event
  // controller passes event to embed svc for rendering
  // 
  // when a site url is used, the event url is the search query with uid of the event
  // 
  // base url is given by embed configuration.
  // 

}

function addCalendarLinks( event, eventUrl ) {

  if ( !event.locations || !event.locations.length ) {

    return;

  }

  event.locations[ 0 ].timings.forEach( function( timing ) {

    timing.calendarLinks = {
      google: _googleLink( event, timing, eventUrl ),
      yahoo: _yahooLink( event, timing, eventUrl ),
      live: _liveLink( event, timing, eventUrl )
    };

  });

}

function _googleLink( event, timing, eventUrl ) {

  return [
    'http://www.google.com/calendar/event?action=TEMPLATE',
    '&text=', encodeURIComponent( event.getTitle() ),
    '&dates=', _linkifyTime( timing.start ), '/', _linkifyTime( timing.end ),
    '&sprop=website:', eventUrl,
    '&details=', encodeURIComponent( event.getDescription() + ' - ' + eventUrl ),
    '&location=', encodeURIComponent( event.getLocationName() + ' - ' + event.getAddress() )
  ].join('');

}


function _yahooLink( event, timing, eventUrl ) {

  return [
    'http://calendar.yahoo.com/?v=60',
    '&TITLE=', encodeURIComponent( event.getTitle() ),
    '&ST=', _linkifyTime( timing.start ),
    '&DUR=', ( timing.end - timing.start ) / ( 1000 * 60 * 60 ),
    '&in_loc=', encodeURIComponent( event.getLocationName() + ' - ' + event.getAddress() ),
    '&DESC=', encodeURIComponent( event.getDescription() + ' - ' + eventUrl ),
    '&URL=', eventUrl
  ].join('');

}


function _liveLink( event, timing, eventUrl ) {

  return [
    'http://calendar.live.com/calendar/calendar.aspx?rru=addevent',
    '&summary=', encodeURIComponent( event.getTitle() ),
    '&location=', encodeURIComponent( event.getLocationName() + ' - ' + event.getAddress() ),
    '&dtstart=', _linkifyTime( timing.start ),
    '&dtend=', _linkifyTime( timing.end ),
    '&description=', encodeURIComponent( event.getDescription() + ' - ' + eventUrl )
  ].join('');

}


function _linkifyTime( time ) {

  return JSON.stringify( time ).replace( /00\.0|:|-|"/g, '' );

}

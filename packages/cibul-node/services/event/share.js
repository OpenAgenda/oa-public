"use strict";

var log = require( '@openagenda/logs' )( 'event share service' ),

config = require( '../../config' ),

genUrl = require( '../genUrl' ).abs;

module.exports = {
  addCalendarLinks,
  getSocialLinks,
  getFacebookFeedLink
};

function getFacebookFeedLink( event, eventUrl, appId ) {

  var link = 'https://www.facebook.com/dialog/feed?display=popup&link=' + eventUrl

  + '&redirect_uri=' + encodeURIComponent( eventUrl )

  + '&name=' + encodeURIComponent( event.title )

  + '&caption=' + encodeURIComponent( event.dateRange )

  + '&description=' + encodeURIComponent( event.description )

  + '&app_id=' + appId;

  if ( event.image ) {

    link += '&picture=' + encodeURIComponent( event.image );

  }

  return link;

}

function getSocialLinks( event, eventUrl, siteUrl ) {

  if ( !siteUrl ) {

    siteUrl = config.root;

  }

  return {
    facebookShare: _facebookShare( event, eventUrl ),
    twitterShare: _twitterShare( event, eventUrl ),
    linkedInShare: _linkedInShare( event, eventUrl, siteUrl ),
    googleShare: _googleShare( event, eventUrl ),
    pinterestShare: _pinterestShare( event, eventUrl ),
    tumblrShare: _tumblrShare( event, eventUrl ),
    emailShare: _emailShare( event )
  }

}

function addCalendarLinks( event, eventUrl, agenda ) {

  if ( !event.locations || !event.locations.length ) {

    return;

  }

  event.locations[ 0 ].timings.forEach( ( timing, i ) => {

    timing.calendarLinks = {
      google: _googleLink( event, timing, eventUrl ),
      yahoo: _yahooLink( event, timing, eventUrl ),
      live: _liveLink( event, timing, eventUrl )
    };

    if ( agenda ) {

      timing.calendarLinks.ics = genUrl( 'agendaEventIcsShow', {
        slug: agenda.slug,
        eventSlug: event.slug,
        timing: i,
        dl: 1
      } );

    }

  });

}

function _googleLink( event, timing, eventUrl ) {

  return [
    'https://www.google.com/calendar/event?action=TEMPLATE',
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
  ].join( '' );

}


function _facebookShare( event, eventUrl ) {

  return 'https://www.facebook.com/sharer.php?u=' + encodeURIComponent( eventUrl );

}

function _twitterShare( event, eventUrl ) {

  return 'https://twitter.com/share?url=' + encodeURIComponent( eventUrl )

  + '&text=' + encodeURIComponent( event.getTitle() );

}

function _linkedInShare( event, eventUrl, siteUrl ) {

  return 'http://www.linkedin.com/shareArticle?url=' + encodeURIComponent( eventUrl )

  + '&title=' + encodeURIComponent( event.getTitle() )

  + '&summary=' + encodeURIComponent( event.getDescription() + ' - ' + eventUrl )

  + '&source=' + encodeURIComponent( siteUrl );

}

function _googleShare( event, eventUrl ) {

  return 'https://plus.google.com/share?url=' + encodeURIComponent( eventUrl );

}

function _pinterestShare( event, eventUrl ) {

  var shareLink = 'http://pinterest.com/pin/create/button/'
                + '?url=' + encodeURIComponent( eventUrl )
                + '&description=' + encodeURIComponent( event.getDescription() )
                + '&is_video=false',

  image = event.getImage( true );

  if ( image ) {

    shareLink += '&media=' + encodeURIComponent( image );

  }

  return shareLink;

}

function _tumblrShare( event, eventUrl ) {

  return 'http://tumblr.com/share?s=&v=3&u='

  + encodeURIComponent( eventUrl )

  + '&title=' + encodeURIComponent( event.getTitle() );

}

function _emailShare( event ) {

  if ( event.isInAgendaContext() ) {

    var agenda = event.getAgendaContext();

    return genUrl( 'agendaEventActionShow', {
      slug: agenda.slug,
      eventSlug: event.slug,
      action: 'email'
    });

  } else {

    return genUrl( 'eventActionShow', {
      eventSlug: event.slug,
      action: 'email'
    } );

  }


}



function _linkifyTime( time ) {

  return JSON.stringify( time ).replace( /00\.0|:|-|"/g, '' );

}

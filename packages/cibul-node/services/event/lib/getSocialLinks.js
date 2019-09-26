"use strict";

const config = require( '../../../config' );
const genUrl = require( '../../genUrl' ).abs;

module.exports = getSocialLinks;

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

    return '#';

  }


}

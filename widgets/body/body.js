"use strict";

var UID = 0,

cn = require( '../../js/lib/common/common.mod.js' ),

wLib = require( '../lib/widgetLib' ),

frameLink = require( '../lib/frameLink' ).parent,

bottomHit = require( '../lib/bottomHit' ),

debug = require( 'debug' ),

config = {
  all: {
    heightOffset: 40,
    res: {  
      agenda: '//cibul.net/agendas/:uid/embed/events',
      customAgenda: '//cibul.net/agendas/:uid/embeds/:embedUid/events',
      event: '//cibul.net/agendas/:uid/embed/events/:eventUid',
      customEvent: '//cibul.net/agendas/:uid/embeds/:embedUid/events/:eventUid'
    }
  },
  dev: {
    res: {  
      agenda: '//d.cibul.net/agendas/:uid/embed/events',
      customAgenda: '//d.cibul.net/agendas/:uid/embeds/:embedUid/events',
      event: '//cibul.net/agendas/:uid/embed/events/:eventUid',
      customEvent: '//cibul.net/agendas/:uid/embeds/:embedUid/events/:eventUid'
    }
  },
  tpl: {
    res: {  
      agenda: 'http://localhost:3000/agenda/embedShow',
      customAgenda: 'http://localhost:3000/agenda/embedShow',
      event: 'http://localhost:3000/event/embedShow',
      customEvent: 'http://localhost:3000/event/embedShow'
    }
  }
};

if ( ['tpl', 'dev'].indexOf( window.env ) !== -1 ) {

  debug.enable( '*' );

  config = cn.extend( config.all, config[ window.env ] );

} else {

  config = config.all;

}


/**
 * register the widget
 */

require( '../lib/controllerLoader' )( function( register ) {

  wLib.forEachAnchor( '.cbpgbdy', { register: register }, widget );

});


/**
 * define widget
 */

function widget( elem, options ) {

  var log = debug( 'body' ),

  controller,

  agendaRes, eventRes;

  ( function() {

    _loadRes( options.anchorConfig );

    _frameLink( function( sendFunc ) {

      bottomHit.enable( elem, function() {

        sendFunc( { bottom: true } );

      });

    }, function( frameMessage ) {

      if ( frameMessage.height ) _adjustFrameHeight( frameMessage.height );

    } );

  } )();


  function _frameLink( onReady, onMessage ) {

    // for first page load
    var handler = frameLink( elem, onReady, function( message ) {

      if ( message.load ) {

        if ( _isFrameLink( message.load ) ) {

          _resetLink( handler, _clean( message.load ) );

        } else {

          window.location.href = message.load;

        }

      } else {

        onMessage( message );

      }

    }, agendaRes );

    // for subsequent frame loads
    cn.addEvent( elem, 'load', function() {

      handler.start();

    });

  }


  function _isFrameLink( href ) {

    var stripped = href.split( /\?|#/ )[ 0 ];

    return stripped.match( agendaRes ) || stripped.match( eventRes );

  }

  function _clean( href ) {

    if ( window.env !== 'tpl' ) return href;

    if ( href.split( '#' )[1].match( 'agendaEventShow' ) )  {

      return eventRes;

    } else if ( href.split( '#' )[1].match( 'agendaShow' ) ) {

      return agendaRes;

    }

    return href;

  }


  function _resetLink( handler, src ) {

    handler.stop();

    elem.setAttribute( 'src', src );

    handler.resetSrc( src );

    handler.start();

  }


  function _loadRes( src ) {

    var uids = src.match( /[0-9]+/g );

    if ( uids && uids.length >= 1 ) {

      agendaRes = config.res.agenda.replace( ':uid', uids[ 0 ] );

      eventRes = config.res.event.replace( ':uid', uids[ 0 ] );

      if ( uids.length == 2 ) {

        agendaRes = config.res.agenda.replace( ':embedUid', uids[ 1 ] );

        eventRes = config.res.event.replace( ':embedUid', uids[ 0 ] );

      }

    } else {

      if ( window.env !== 'tpl' ) throw 'Could not read embed identifiers';

      agendaRes = config.res.agenda;

      eventRes = config.res.event;

    } 

  }


  function _adjustFrameHeight( newHeight ) {

    log( 'adjusting frame height to %s', newHeight );

    elem.setAttribute( 'height', newHeight + config.heightOffset );

  }

}
"use strict";

var UID = 0,

cn = require( '../../js/lib/common/common.mod.js' ),

wLib = require( '../lib/widgetLib' ),

frameLink = require( '../lib/frameLink' ).parent,

bottomHit = require( '../lib/bottomHit' ),

debug = require( 'debug' ),

qs = require( 'qs' ),

config = {
  all: {
    heightOffset: 40,
    res: {  
      agenda: '//pre.openagenda.com/agendas/:uid/embed/events',
      customAgenda: '//pre.openagenda.com/agendas/:uid/embeds/:embedUid/events',
      event: '//pre.openagenda.com/agendas/:uid/embed/events/:eventUid',
      customEvent: '//pre.openagenda.com/agendas/:uid/embeds/:embedUid/events/:eventUid'
    }
  },
  dev: {
    res: {  
      agenda: '//d.openagenda.com/agendas/:uid/embed/events',
      customAgenda: '//d.openagenda.com/agendas/:uid/embeds/:embedUid/events',
      event: '//d.openagenda.com/agendas/:uid/embed/events/:eventUid',
      customEvent: '//d.openagenda.com/agendas/:uid/embeds/:embedUid/events/:eventUid'
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

    log( 'initing' );
    
    var uid = _loadRes( options.anchorConfig );

    controller = options.register( wLib.interface( 'body', uid, {
      change: change 
    } ));

    controller.getControlData( function( data ) {

      _initSrc( controller.getCurrentQuery() );

      _frameLink( function( href, sendFunc ) {
        
        _update( href );

        bottomHit.enable( elem, function() {

          sendFunc( { bottom: true } );

        });

      }, function( frameMessage ) {

        if ( frameMessage.height ) _adjustFrameHeight( frameMessage.height );

        if ( frameMessage.update ) {

          log( 'received update from frame: %s', JSON.stringify( frameMessage.update ) );

          controller.update( 'body', frameMessage.update );

        }

      } );
      
    });


  } )();


  function change( reqParams ) {

    log( 'change notification received with %s', JSON.stringify( reqParams ) );

    var res;

    if ( reqParams.uid ) {

      res = _getEventRes( reqParams.uid );

    } else {

      res = _getAgendaRes( reqParams );
      
    }

    elem.setAttribute( 'src', res );

  }


  function _update( href ) {

    var values = {};

    if ( _isEventLink( href ) ) {

      // extract actual uid here
      values.uid = _getEventUid( href );

    } else if ( _isAgendaLink( href ) ) {

      values.uid = null;

    }

    log( 'updating request params "%s"', JSON.stringify( values ) );

    controller.update( 'body', values );

  }


  function _frameLink( onReady, onMessage ) {

    frameLink( elem, onReady, function( message ) {

      if ( message.load ) {

        if ( _isEventLink( message.load ) ) {

          elem.setAttribute( 'src', _clean( message.load ) );

          _goToFrameTop();

        } else if ( _isAgendaLink( message.load ) ) {

          var currentQuery = controller.getCurrentQuery();

          delete currentQuery.uid;

          elem.setAttribute( 'src', _clean( message.load + '?' + qs.stringify( { search: currentQuery } ) ) );

        } else {

          window.location.href = message.load;

        }

      } else {

        onMessage( message );

      }

    }, agendaRes );

  }


  function _getEventRes( uid ) {

    if ( window.env == 'tpl' ) {

      return eventRes + '#uid=' + uid;

    }

    return eventRes.replace( ':eventUid', uid );

  }
  

  function _getEventUid( href ) {

    var uids;

    if ( window.env == 'tpl' ) {

      return 88888888;

    }

    uids = href.replace( eventRes.replace( ':eventUid', '' ), '' ).match( /[0-9]+/g );

    if ( !uids || !uids.length ) {

      log( 'could not retrieve event uid' );

      return;

    }

    return uids[ 0 ];

  }


  function _isEventLink( href ) {

    var stripped;

    if ( window.env == 'tpl' ) {

      return !! href.match(/#agendaEventShow|\/event\/embedShow/g);

    }

    stripped = href.replace(/http(s|):/, '').split( /\?|#/ )[ 0 ];

    return stripped.match( eventRes.replace( ':eventUid', '[0-9]+') );

  }


  function _getAgendaRes( reqParams ) {

    var query = qs.stringify( { search: reqParams } );

    if ( window.env == 'tpl' ) {

      return agendaRes + '#query=' + query;

    }

    return agendaRes + '?' + query;

  }


  function _isAgendaLink( href ) {

    var stripped;

    if ( window.env == 'tpl' ) {

      return !!href.match( /#embedShow|\/agenda\/embedShow($|^#)/g );

    }

    stripped = href.replace(/http(s|):/, '').split( /\?|#/ )[ 0 ];

    return stripped.match( agendaRes );

  }


  function _clean( href ) {

    if ( window.env !== 'tpl' ) return href;

    if ( href.split( '#' )[1].match( 'agendaEventShow' ) )  {

      return eventRes;

    } else if ( href.split( '#' )[1].match( 'embedShow' ) ) {

      return agendaRes;

    }

    return href;

  }


  function _initSrc( query ) {

    if ( cn.size( query ) ) {

      change( query );

    }

  }


  function _loadRes( src ) {

    var uids = window.env=='tpl' ? [ 123456 ] : src.match( /\/[0-9]+\//g ).map( function( uid ) {

      return uid.substr( 1, uid.length - 2 );

    });

    if ( uids && uids.length >= 1 ) {

      agendaRes = config.res[ uids.length == 2 ? 'customAgenda' : 'agenda' ].replace( ':uid', uids[ 0 ] );

      eventRes = config.res[ uids.length == 2 ? 'customEvent' : 'event' ].replace( ':uid', uids[ 0 ] );

      if ( uids.length == 2 ) {

        agendaRes = agendaRes.replace( ':embedUid', uids[ 1 ] );

        eventRes = eventRes.replace( ':embedUid', uids[ 1 ] );

      }

    } else {

      if ( window.env !== 'tpl' ) throw 'Could not read embed identifiers';

      agendaRes = config.res.agenda;

      eventRes = config.res.event;

    }
    
    return uids.join('/');

  }


  function _adjustFrameHeight( newHeight ) {

    log( 'adjusting frame height to %s', newHeight );

    elem.setAttribute( 'height', newHeight + config.heightOffset );

  }

  function _goToFrameTop() {

    window.scrollTo( 0, elem.offsetTop );  

  }

}
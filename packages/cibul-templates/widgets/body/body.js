"use strict";

const _ = {
  get: require( 'lodash/get' ),
  first: require( 'lodash/first' ),
  omit: require( 'lodash/omit' )
};

const debug = require( 'debug' );

const qs = require( 'qs' );

const du = require( '@openagenda/dom-utils' );
const utils = require( '@openagenda/utils' );

const bottomHit = require( '../lib/bottomHit' );
const domain = require( '../../domain' );
const frameLink = require( '../lib/frameLink' ).parent;
const style = require( './style.css' );
const styler = require( '../lib/widgetStyler' );
const wLib = require( '../lib/widgetLib' );

let UID = 0;

let config = {
  all: {
    heightOffset: 40,
    res: {
      agenda: '//' + domain + '/agendas/:uid/embed/events',
      customAgenda: '//' + domain + '/agendas/:uid/embeds/:embedUid/events',
      event: '//' + domain + '/agendas/:uid/embed/events/:eventUid',
      customEvent: '//' + domain + '/agendas/:uid/embeds/:embedUid/events/:eventUid'
    }
  },
  development: {
    res: {
      agenda: '//d.openagenda.com/agendas/:uid/embed/events',
      customAgenda: '//d.openagenda.com/agendas/:uid/embeds/:embedUid/events',
      event: '//d.openagenda.com/agendas/:uid/embed/events/:eventUid',
      customEvent: '//d.openagenda.com/agendas/:uid/embeds/:embedUid/events/:eventUid'
    }
  },
  preview: {
    res: {
      agenda: '/agendas/:uid/embed/events',
      customAgenda: '/agendas/:uid/previewEmbeds/:embedUid/events',
      event: '/agendas/:uid/embed/previewEmbeds/:eventUid',
      customEvent: '/agendas/:uid/previewEmbeds/:embedUid/events/:eventUid'
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


/**
 * register the widget
 */

require( '../lib/loader' )( {
  selector: '.cbpgbdy',
  backup: { // drupal removes classes
    selector: '[data-oabdy]',
    classNames: 'cibulFrame'
  },
  widget: widget
} );


/**
 * define widget
 */

function widget( elem, options ) {

  var env = elem.hasAttribute( 'data-preview' ) ? 'preview' : window.env;

  if ( ['tpl', 'development', 'preview' ].indexOf( env ) !== -1 ) {

    debug.enable( '*' );

    config = utils.extend( config.all, config[ env ] );

  } else {

    config = config.all;

  }

  var lang;

  var allowCookies = true;

  var log = debug( 'body' ),

  controller,

  agendaRes, eventRes;

  ( function() {

    log( 'initing' );

    var uid = _loadFromUidAttribute( elem.getAttribute( 'data-uid' ) ) || _loadRes( options.anchorConfig[ 0 ] );

    controller = options.register( wLib.interface( 'body', uid, { change  } ));

    allowCookies = _allowCookies();

    styler( style );

    controller.requestModal( 'body' );

    controller.getControlData( function( data ) {

      _initSrc( controller.getCurrentQuery() );

      _frameLink( function( href, sendFunc ) {

        _update( href );

        // wait till sweep is done
        setTimeout( function() {

          controller.releaseModal();

        }, 30 );

        bottomHit.enable( elem, function() {

          sendFunc( { bottom: true } );

        });

      }, frameMessage => {

        if ( frameMessage.height ) _adjustFrameHeight( frameMessage.height );

        if ( frameMessage.update ) {

          log( 'received update from frame: %s', JSON.stringify( frameMessage.update ) );

          controller.update( 'body', frameMessage.update );

          change( controller.getCurrentQuery() );

        }

      } );

    });


  } )();


  function change( reqParams ) {

    log( 'change notification received with %s', JSON.stringify( reqParams ) );

    let eventUid = _.get( reqParams, 'uid' );

    if ( eventUid ) return _setSrc( _getEventRes( eventUid ) );

    let eventSlug = _.get( reqParams, 'event' );

    if ( !eventSlug ) return _setSrc( _getAgendaRes( reqParams ) );

    controller.getControlData( data => {

      eventUid = _.get( _.first( data.ev.filter( e => e.s === eventSlug ) ), 'u' );

      if ( !eventUid ) return _setSrc( _getAgendaRes( reqParams ) );

      _setSrc( _getEventRes( eventUid ) );

    } );

  }


  function _update( href ) {

    if ( typeof href === 'undefined' ) {

      log( 'cannot update frame with undefined href' );

      return;

    }

    var hrefQuery = _readQueryPart( href, 'oaq', {} );

    controller.getControlData( function( data ) {

      if ( _isEventLink( href ) ) {

        const eventUid = _getEventUid( href );

        let slug = null;

        if ( data.ebd.ues ) {

          slug = _.get( _.first( data.ev.filter( e => e.u === parseInt( eventUid ) ) ), 's' );

        }

        if ( slug ) {

          hrefQuery.event = slug;

        } else {

          hrefQuery.uid = eventUid;

        }

      }

      log( 'updating request params "%s"', JSON.stringify( hrefQuery ) );

      controller.update( 'body', hrefQuery );

    } );

  }


  function _frameLink( onReady, onMessage ) {

    frameLink( elem, onReady, function( message ) {

      log( 'received message from frame: %s', message );

      if ( !message.load ) {

        return onMessage( message );

      }


      log( 'message is a load request: %s', message.load );

      if ( _isEventLink( message.load ) ) {

        log( 'message is an event link' );

        _setSrc( _clean( message.load ) );

        return _goToFrameTop();

      }

      if ( _isAgendaLink( message.load ) ) {

        log( 'message is an agenda list link' );

        var currentQuery = controller.getCurrentQuery(),

        newSrc, queryChangeRequest;

        if ( message.load.indexOf( '?' ) === -1 ) {

          // agenda link has no associated filter

          newSrc = _clean( message.load + '?' + qs.stringify( { oaq: _.omit( currentQuery, [ 'uid', 'event' ] ) } ) );

        } else {

          // frame is requesting a change in filter

          queryChangeRequest = ( qs.parse( message.load.substr( message.load.indexOf( '?' ) + 1 ) ) || {} ).oaq;

          if ( typeof queryChangeRequest == 'undefined' ) {

            queryChangeRequest = {};

          }

          if ( currentQuery.passed ) queryChangeRequest.passed = 1;

          newSrc = _clean( message.load.substr( 0, message.load.indexOf( '?' ) + 1 ) + qs.stringify( { oaq: queryChangeRequest } ) );

        }

       return  _setSrc( newSrc );

      }


      log( 'message is an external link' );

      if ( ( typeof message.target !== 'undefined' ) && ( message.target === '_blank' ) && !du.isSafari() ) {

        return window.open( message.load, '_blank' );

      }

      window.location.href = message.load;

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

  function _setSrc( href ) {

    var parts = href.split( '?' ),

    path = parts[ 0 ],

    query = qs.parse( parts.length > 1 ? parts[ 1 ] : {} ),

    src;

    // insert language
    if ( lang ) query.lang = lang;

    // if not allowed, disable cookie
    if ( !allowCookies ) query.disableCookies = '1';

    src = path + '?' + qs.stringify( query );

    log( 'setting frame source to %s', src );

    elem.setAttribute( 'src', src );

    controller.requestModal( 'body' );

  }


  function _isEventLink( href ) {

    var stripped;

    if ( window.env == 'tpl' ) {

      return !! href.match(/#agendaEventShow|\/event\/embedShow/g);

    }

    stripped = href.replace(/http(s|):/, '').split( /\?|#/ )[ 0 ];

    return stripped.match( eventRes.replace( ':eventUid', '[0-9]+').split( '?' )[ 0 ] );

  }


  function _getAgendaRes( reqParams ) {

    var query = qs.stringify( { oaq: reqParams } );

    if ( window.env == 'tpl' ) {

      return agendaRes + '#query=' + query;

    }

    return agendaRes + ( agendaRes.indexOf( '?' ) == -1 ? '?' : '&' ) + query;

  }


  function _isAgendaLink( href ) {

    var stripped;

    if ( window.env == 'tpl' ) {

      return !!href.match( /#embedShow|\/agenda\/embedShow($|^#)/g );

    }

    stripped = href.replace(/http(s|):/, '').split( /\?|#/ )[ 0 ];

    return stripped.match( agendaRes.split( '?' )[ 0 ] );

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

    if ( utils.size( query ) || !elem.hasAttribute( 'src' ) ) {

      change( query );

    }

  }


  function _allowCookies() {

    if ( elem.hasAttribute( 'src' ) && elem.getAttribute( 'src' ).indexOf( 'disableCookies' ) !== 1 ) {

      return false;

    }

    return true;

  }


  function _loadFromUidAttribute( uid ) {

    if ( !uid ) return null;

    _initAgendaRes( uid.split( '/' ) );

    lang = elem.getAttribute( 'data-lang' ) || 'fr';

    return uid;

  }

  function _initAgendaRes( uids ) {

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

  }


  function _loadRes( src ) {

    var uids = [];

    if ( elem.hasAttribute( 'data-lang' ) ) {

      lang = elem.getAttribute( 'data-lang' );

    } else {

      lang = _readQueryPart( src, 'lang', false );

    }

    uids = window.env=='tpl' ? [ 123456 ] : src.match( /\/[0-9]+\//g ).map( function( uid ) {

      return uid.substr( 1, uid.length - 2 );

    });

    _initAgendaRes( uids );

    return uids.join('/');

  }


  function _adjustFrameHeight( newHeight ) {

    log( 'adjusting frame height to %s', newHeight );

    elem.setAttribute( 'height', newHeight + config.heightOffset );

  }

  function _goToFrameTop() {

    window.scrollTo( 0, _findPos( elem ).top - 40 );

  }

}

function _findPos( obj ) {

  var o = { left: 0, top: 0 };

  if ( obj.offsetParent ) {

    do {
        o.left += obj.offsetLeft;
        o.top += obj.offsetTop;

    } while ( obj = obj.offsetParent );

  }

  return o;

}

function _readQueryPart( res, key, defaultValue ) {

   return ( res.indexOf( '?') === -1 ? {} : qs.parse( res.substr( res.indexOf( '?' ) + 1 ) ) )[ key ] || defaultValue;

}

var UID = 0,

cn = require( '../../js/lib/common/common.mod.js' ),

wLib = require( '../lib/widgetLib' ),

debug = require( 'debug' ),

tunnelLib = require( '../../js/lib/iTunnel/iTunnel.js' ),

config = {
  events: {
    load: 'load'
  },
  scrollOffset: 50,
  heightOffset: 40
};

if ( cn.contains( [ 'tpl', 'dev' ], window.env ) ) debug.enable( '*' );

var widget = function( elem, options ) {

  var log,

  controller,

  hasNext = false,      // state indicating if there are more events to load

  activeEventUid = false,    // state indicating if event is being displayed or not

  autoscroll = true,    // state indicating if list should load automatically

  listPos = false,

  requestParams = {}, // current know state of request params

  tunnel, // link to inside of iframe

  init = function() {

    var uid = _readUid( options.anchorConfig );

    log = debug( 'list widget ' + uid );

    log( 'initing' );
    
    controller = options.register( wLib.interface( 'list', uid, {
      change : change
    } ));

    controller.getControlData( function( data ) {

      autoscroll = true;

      if ( data.ebd && !data.ebd.sc ) {

        autoscroll = false;

      }

      cn.addEvent( document, 'scroll', _monitorScroll );

    } );

    _initTunnel({
      'eventopensuccess' : _onEventOpen,
      'closeevent' : _onEventClose,
      'eventdateplaceselect' : _onEventDatePlaceSelect,
      'eventmapplaceunselect' : _onEventMapPlaceUnselect,
      'success' : _onListChange,
    });

  },

  _onEventOpen = function( data ) {

    activeEventUid = data.uid;

    _repositionToFrameTop();

    _update({ uid: data.uid });

  },

  _onEventClose = function( data ) {

    activeEventUid = false;

    _repositionToListOffset();

    _update({ uid: null });

  },

  _onEventDatePlaceSelect = function( data ) {

    if ( activeEventUid ) {

      _update({ uid: activeEventUid, location: data.location });
      
    }

  },

  _onEventMapPlaceUnselect = function( data ) {

    if ( activeEventUid ) {

      _update({ uid: activeEventUid });

    }

  },

  _onListChange = function( data ) {

    var clean = _clean( data );

    for( var r in requestParams ) {

      if ( typeof clean[r] == 'undefined' ) { // active unset params

        requestParams[r] = null;

      }

    }

    for( var r in clean ) {

      requestParams[r] = clean[r];

    }

    _update( requestParams );

  },

  _clean = function( data ) {

    var clean = {};

    for( var i in data ) {

      if ( !cn.contains( [ 'count', 'next', 'prev', 'reset', 'event', 'page' ],  i ) ) {

        clean[ i ] = data[ i ];

      }

    }

    return clean;

  },

  change = function( reqParams ) {

    requestParams = cn.extend({
      location: null,
      tags: null,
      category: null,
      from: null,
      to: null,
      what: null,
      uid: null
    }, reqParams );

    log( 'change of params to "%s" - sending to frame', JSON.stringify( reqParams ) );

    tunnel.send(cn.extend({ event: config.events.load  }, requestParams ));

  },

  _monitorScroll = function() {

    if ( activeEventUid ) return;

    listPos = _scrollPosition();

    if ( autoscroll && !responsePending && hasNext && ( elem.offsetTop + elem.offsetHeight <= listPos + cn.el( 'html' ).clientHeight ) ) {
      
      responsePending = true;
      
      tunnel.send({ event: 'loadNext' });

    }

  },

  _update = function( params ) {

    log( 'updating request params "%s"', JSON.stringify( params ) );

    controller.update( 'list', params );

  },

  _initTunnel = function( cbs ) {

    tunnel = tunnelLib.iTunnel({ target: elem, onReceive: function( data ) {

      responsePending = false;

      // adjust height if required
      if ( data.height ) {

        elem.style.height = ( parseInt( data.height, 10 ) + config.heightOffset ) + 'px';

        delete data.height;

      }

      // does list have more content to load?
      
      if ( data.hasNext ) hasNext = ( data.hasNext == 'true' );

      if ( data.event == 'hasNext' ) return;

      // callback should only be called if a load has been successful

      if ( typeof cbs[ data.event ] == 'undefined' ) {

        log( 'unknown frame event: %s', data.event );

      } else {

        cbs[ data.event ]( data );

      }

    } });

  },

  _repositionToFrameTop = function() {

    var framePos = _findPos()[1];

    if ( _scrollPosition() > framePos ) {

      _scrollPosition( Math.max( 0, framePos - config.scrollOffset ) );

    }

  },

  _repositionToListOffset = function() {

    var offsetPos = listPos;

    setTimeout( function() {

      if ( offsetPos ) _scrollPosition( offsetPos );

    }, 200 );

  },

  _scrollPosition = function(value) {

    if ( typeof value !== 'undefined' ) scrollTo( 0, value );

    return cn.getScrollOffsets().y;
    
  },

  _findPos = function() {

    var curleft = 0, curtop = 0, element = elem;

    if ( element.offsetParent ) {

      do {

        curleft += element.offsetLeft;
        curtop += element.offsetTop;

      } while ( element = element.offsetParent);

    }

    return [ curleft, curtop ];

  },

  _readUid = function( src ) {

    var parts = src.split('/');

    return parts.splice(parts.length-2, 2).join('/').split('?')[ UID ];

  }

  init();

};

require( '../lib/controllerLoader' )( function( register ) {

  wLib.forEachAnchor( '.cbpglst', { register: register }, widget );

});
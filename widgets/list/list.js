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

  initing = true,

  sync, syncTimeout, queued, pending,

  currentListParams = {}, // current know state of request params

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

  _isSame = function( o1, o2 ) {

    return JSON.stringify( o1 ) == JSON.stringify( o2 );

  }

  _onListChange = function( data ) {

    log( 'received data from tunnel' );

    pending = false;

    var clean = _clean( data );

    if ( !sync ) {

      if ( _isSame( clean, currentListParams ) ) {

        sync = true;

        log( 'list is in sync' );

      }

      return _processQueued();

    }

    for( var r in currentListParams ) {

      if ( typeof clean[r] == 'undefined' ) { // active unset params

        currentListParams[r] = null;

      }

    }

    /**
     * any value not expected to be changed by embed
     * is filtered out before values are copied
     */

    for( var r in _filtered( clean ) ) {

      currentListParams[r] = clean[r];

    }

    _update( currentListParams );

    _processQueued();

  },

  _processQueued = function() {

    if ( queued ) {

      _send( queued );

      queued = false;

    }

  },

  _filtered = function( values ) {

    var filteredValues = cn.extend( {}, values );

    [ 'neLat', 'neLng', 'swLat', 'swLng' ].forEach( function( f ) {

      if ( filteredValues[ f ] ) delete filteredValues[ f ];

    });

    return filteredValues;

  },

  _clean = function( data ) {

    var clean = {};

    for( var i in data ) {

      if ( !cn.contains( [ 'count', 'next', 'prev', 'reset', 'event', 'page' ],  i ) ) {

        clean[ i ] = data[ i ];

      }

    }

    if ( clean.tags ) {

      clean.tags = clean.tags.split( ',' );

    }

    [ 'neLat', 'neLng', 'swLat', 'swLng' ].forEach( function( f ) {

      if ( clean[ f ] ) clean[ f ] = parseFloat( clean[ f ] );

    });

    return clean;

  },

  change = function( reqParams ) {

    currentListParams = cn.extend({}, reqParams );

    var sentParams = cn.extend({
      location: null,
      tags: null,
      category: null,
      from: null,
      to: null,
      what: null,
      uid: null,
      neLat: null,
      neLng: null,
      swLat: null,
      swLng: null,
      event: config.events.load
    }, reqParams );

    log( 'change of params to "%s" - sending to frame', JSON.stringify( sentParams ) );

    if ( pending ) {

      log( 'list is pending response, queuing' );

      queued = sentParams;

    } else {

      _send( sentParams );

    }

  },

  _send = function( data ) {

    log( 'sending to frame' );

    _setUnsynced();

    pending = true;

    tunnel.send( data );

  },

  _setUnsynced = function() {

    if ( syncTimeout ) {

      clearTimeout( syncTimeout );

      syncTimeout = false;

    }

    sync = false;

    syncTimeout = setTimeout( function() { sync = true; syncTimeout = false; }, 6000 );

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
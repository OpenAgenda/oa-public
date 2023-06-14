"use strict";

var controllers = require( '../../widgets/controller/main' ),

embedded = require( '../../widgets/lib/embeddedPage' ),

domUtils = require( '../../js/lib/domUtils' ),

facebookEmbedded = require( '../../widgets/lib/facebookPage' ),

debug = require( 'debug' ), log = console.log,

activeFilters = require( '../../widgets/activeFilters/activeFilters' ),

list = require( './list' ),

cn = require( '../../js/lib/common' ),

handler,

favorites = require( './favorites' ),

Masonry = require( 'masonry-layout' ),

imagesLoaded = require( 'imagesloaded' ),

msnry = false,

defaults = {
  selectors: {
    listContent: '.js_list_content',
    loadNext: '.js_load_next',
    searchLinks: '.js_use_search' // add search params to links with this class
  },
  cascading: false
},

params;

window.asap( function( options ) {

  params = cn.extend( {
    autoscroll: true
  }, defaults, options );

  log = debug( 'embedded agenda show' );

  log( 'initing with options %s', JSON.stringify( params ) );

  if ( params.facebook ) {

    handler = _initFacebook( params, list );

  } else {

    handler = _initEmbedded( params );

  }

  window.oaPageHandler = handler;

  _copyToSearch();

  if ( params.cascading ) {

    log( 'cascading mode on' );

    domUtils.whenReady( function() {

      msnry = _masonry( params.selectors.listContent );

    } );

  }

  favorites.init( {
    agendaUid: parseInt( typeof options.uid == 'string' ? options.uid.split( '/' )[ 0 ] : options.uid, 10 ),
    res: options.res,
    bottomBar: false
  } );

  list.init( {
    total: params.total,
    perPage: params.perPage,
    autoLoadNext: false,
    onLastPage: _hideTrigger( params.selectors.loadNext )
  } );

  favorites.sweep();

});

window.hook( function() {
  _handleLoadNextElements( params.selectors.loadNext );
});

/**
 * hack to force reload of page in the event
 */
function _facebookPassedRefreshFix() {

  setTimeout( function() {

    if ( window.location.href.indexOf( 'passed' ) !== -1 ) {

      if ( window.location.href.indexOf( 'refreshed' ) == -1 ) {

        return window.location.href += '&refreshed=';

      }

    }

  }, 200 );

}

function _initFacebook( params, list ) {

  _facebookPassedRefreshFix();

  var handler = facebookEmbedded( params );

  // reset list with controller values when there is a change
  window.cibul.getController( params.uid ).setProxy( {
    update: function( newValues ) {

      log( 'change in iframe %s', JSON.stringify( newValues ) );

      for( var i in newValues ) {

        if ( newValues[ i ] === null ) delete newValues[ i ];

      }

      window.location.href = domUtils.loadInLocation( {
        search: newValues,
        fb: 1
      } );

    }
  } );

  return handler;
}

function _initEmbedded( params ) {

  var handler = embedded( {
    onReceive: function( message ) {

      if ( message.bottom && params.autoscroll ) {

        _loadNext();

      }

    }
  }, params );

  // pass on frame search/query changes to parent window
  window.cibul.getController( params.uid ).setProxy( {
    update: function( newValues, originWidget = null, isExclusive = false ) {

      log( 'change in iframe %s', JSON.stringify( { update: newValues, isExclusive, originWidget } ) );

      handler.send( { update: newValues, isExclusive, originWidget } );

    }
  } );

  //do not manipulate href from inside frame
  window.cibul.getController( params.uid ).disableSyncHref();

  window.cibul.getController( params.uid ).disablePassedAutoLoad();

  return handler;

}


function _handleLoadNextElements( selector ) {

  log( 'adding load next behavior on %s elements', selector );

  cn.forEach( cn.els( selector ), function( elem ) {

    cn.addEvent( elem, 'click', function( e ) {

      log( 'load next is clicked' );

      cn.preventDefault( e );

      _loadNext();

    });

  } );

}

function _loadNext() {

  if ( !handler ) {
    log('handler is not defined, not loading next');
    return;
  }

  list.loadNext( function( err ) {

    if ( msnry ) msnry.reset();

    handler.contentChange();

    favorites.sweep();

  });

}

function _hideTrigger( selector ) {

  return function() {

    cn.forEach( cn.els( selector ), function( elem ) {

      elem.style.display = 'none';

    } );

  }

}


function _copyToSearch() {

  var query = window.location.href.split( '?' );

  if ( !query.length == 2 ) return;

  query = query[ 1 ];

  cn.forEach( cn.els( params.selectors.searchLinks ) || [], function( el ) {

    el.setAttribute( 'href', el.getAttribute( 'href' ).split( '?' )[ 0 ] + '?' + query );

  });

}


function _masonry( listSelector ) {

  var m = _start();

  return {
    reset: _reset,
    start: _start
  }

  function _reset( preventImageLoad ) {

    m.destroy();

    _start( preventImageLoad );

  }

  function _start( preventImageLoad ) {

    var m = new Masonry( listSelector );

    if ( !preventImageLoad ) {

      imagesLoaded( cn.el( listSelector ), function() {

        _reset( true );

        window.oaPageHandler.contentChange();

      } );

    }

    return m;

  }

}

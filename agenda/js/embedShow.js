"use strict";

var controllers = require( '../../widgets/controller/main' ),

embedded = require( '../../widgets/lib/embeddedPage' ),

debug = require( 'debug' ), log,

activeFilters = require( '../../widgets/activeFilters/activeFilters' ),

list = require( './list' ),

cn = require( '../../js/lib/common/common.mod' ),

handler,

Masonry = require( 'masonry-layout' ), 

msnry = false,

defaults = {
  selectors: {
    listContent: '.js_list_content',
    loadNext: '.js_load_next'
  },
  cascading: false
};

window.asap( function( options ) {

  var params = cn.extend( {}, defaults, options );

  log = debug( 'embedded agenda show' );

  log( 'initing with options %s', JSON.stringify( params ) );

  handler = embedded( {
    onReceive: function( message ) {

      if ( message.bottom ) {

        _loadNext();

      }

    }
  }, params );

  // pass on frame search/query changes to parent window
  window.cibul.getController( params.uid ).setProxy( {
    update: function( newValues ) {

      log( 'change in iframe %s', JSON.stringify( newValues ) );

      handler.send( { update: newValues } );

    }
  } );

  //do not manipulate href from inside frame
  window.cibul.getController( params.uid ).disableSyncHref();

  window.cibul.getController( params.uid ).disablePassedAutoLoad();

  if ( params.cascading ) {

    log( 'cascading mode on' );

    msnry = _masonry( params.selectors.listContent );

  }

  list.init( {
    total: params.total,
    perPage: params.perPage,
    autoLoadNext: false,
    onLastPage: _hideTrigger( params.selectors.loadNext )
  } );

  _handleLoadNextElements( params.selectors.loadNext );

});

function _handleLoadNextElements( selector ) {

  cn.forEach( cn.els( selector ), function( elem ) {

    cn.addEvent( elem, 'click', function( e ) {

      cn.preventDefault( e );

      _loadNext();

    });

  } );

}

function _loadNext() {

  if ( !handler ) return;

  list.loadNext( function( err ) {

    handler.contentChange();

    if ( msnry ) msnry.reset();
    
  });

}

function _hideTrigger( selector ) {

  return function() {

    cn.forEach( cn.els( selector ), function( elem ) {

      elem.style.display = 'none';

    } );

  }

}


function _masonry( listSelector ) {

  var m = _start();

  return {
    reset: function() {

      m.destroy();

      _start();

    },
    start: _start
  }

  function _start() {

    return new Masonry( listSelector );

  }

}
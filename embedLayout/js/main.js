var cn = require( '../../js/lib/common/common.mod.js' ),

debug = require( 'debug' ),

log = debug( 'main' ),

layout = require( '../../layout/js/layout' ),

ran = false, asapRan = false,

params = {},

hooks = [], asaps = [];

_onAsapReady( function() {

  _init();

  cn.forEach( asaps, function( asapHook ) {

    asapHook( params );

  });

  asapRan = true;

} );

cn.addEvent( window, 'load', function() {

  _init();

  if ( params.env == 'dev' || window.env == 'dev' ) debug.enable( '*' );

  cn.forEach( hooks, function( hook ) {

    hook( params );

  });

  ran = true;

} );

window.hook = function( cb ) {

  if ( ran ) return cb( params );

  hooks.push( cb );

};

/**
 * same as hook, but ready as soon as options are
 * available
 */

window.asap = function( cb ) {

  if ( asapRan ) return cb( params );

  asaps.push( cb )

}


function _init() {

  // if there is stuff there already, this are inited.
  if ( cn.size( params ) ) return;

  var options = layout.getOptions( 'body' );

  cn.extend( params, options );

  return options;

}


/**
 * callsback when body elem is loaded
 */

function _onAsapReady( timeout, cb ) {

  if ( arguments.length == 1 ) {

    cb = timeout;

    timeout = 0;

  }

  if ( cn.el( 'body' ) ) return cb();

  setTimeout( function() {

    _onAsapReady( Math.min( ( timeout + 10 ) * 2, 10000 ), cb );

  }, timeout );

}
require( 'core-js/stable' );
require( 'regenerator-runtime/runtime' );
require( 'dom4' );
require( '@openagenda/pepjs' );

require( 'intl' );
require( 'intl/locale-data/jsonp/fr' );
require( 'intl/locale-data/jsonp/en' );
require( 'intl/locale-data/jsonp/de' );
require( 'intl/locale-data/jsonp/br' );

var layout = require( '../../layout/js/layout' ),

utils = require( '@openagenda/utils' ),

du = require( '../../js/lib/domUtils' ),

debug = require( 'debug' ),

log = debug( 'main' ),

ran = false, asapRan = false,

params = {},

hooks = [], asaps = [];

du.asapReady( function() {

  _init();

  du.forEach( asaps, function( asapHook ) {

    asapHook( params );

  });

  asapRan = true;

} );

du.addEvent( window, 'load', function() {

  _init();

  if ( params.env == 'development' || window.env == 'tpl' ) {

    debug.enable( '*' );

  }

  du.forEach( hooks, function( hook ) {

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

window.asap = function( cb ) {

  if ( asapRan ) return cb( params );

  asaps.push( cb )

}


function _init() {

  // if there is stuff there already, this are inited.
  if ( utils.size( params ) ) return;

  var options = layout.getOptions( 'body' );

  utils.extend( params, options );

  return options;

}

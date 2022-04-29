require( '@openagenda/polyfills/web' );
require( '@openagenda/polyfills/dom' );
require( '@openagenda/polyfills/intl' );
require( '@openagenda/polyfills/intl-locales' );

var layout = require( '../../layout/js/layout' ),

cn = require( '../../js/lib/common' ),

debug = require( 'debug' ),

log = debug( 'main' ),

ran = false,

params = {},

hooks = [];

cn.addEvent( window, 'load', function() {

  var options = layout.getOptions( 'body' );

  cn.extend( params, options );

  if ( options.env == 'development' || window.env == 'development' ) debug.enable( '*' );

  cn.forEach( hooks, function( hook ) {

    hook( params )

  });

} );

window.hook = function( cb ) {

  if ( ran ) return cb( params );

  hooks.push( cb );

};

require( 'core-js/stable' );
require( 'regenerator-runtime/runtime' );
require( 'dom4' );
require( 'pepjs' );

require( 'intl' );
require( 'intl/locale-data/jsonp/fr' );
require( 'intl/locale-data/jsonp/en' );
require( 'intl/locale-data/jsonp/de' );
require( 'intl/locale-data/jsonp/br' );

var layout = require( '../../layout/js/layout' ),

cn = require( '../../js/lib/common/common.mod.js' ),

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

var cn = require( '../../js/lib/common/common.mod.js' ),

debug = require( 'debug' ),

log = debug( 'main' ),

layout = require( '../../layout/js/layout' ),

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
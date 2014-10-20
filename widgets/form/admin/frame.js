var widget = require( '../map' ),

controllers = require( '../../controller/main' ),

log = require( 'debug' )( 'map admin frame' );

controllers.getWidget( 'map', function( mapWidget ) {

  log( 'setting on bounds change' );

  mapWidget.setOnBoundsChange( window.parent.onBoundsChange );

} );
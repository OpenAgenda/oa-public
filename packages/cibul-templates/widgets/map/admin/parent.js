var cn = require( '../../../js/lib/common' ),

debug = require( 'debug' ),

log = debug( 'map admin parent' ),

params = {
  selectors: {
    cornersInput: '.js_map_corners'
  }
};

window.onBoundsChange = function( newBounds ) {

  log( 'received new bounds: %s', JSON.stringify( newBounds ) );

  cn.el( params.selectors.cornersInput ).value = [ newBounds.neLat, newBounds.neLng, newBounds.swLat, newBounds.swLng ].join('|');

};

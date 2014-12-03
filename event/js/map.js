var cn = require( '../../js/lib/common/common.mod.js' ),

mapLib = require( '../../js/lib/maps/osm.maps.mod' ),

params = {
  selectors: {
    canvas: '.js_map'
  },
  attributes: {
    coord: 'data-coord'
  },
  tiles: 'http://{s}.tiles.mapbox.com/v3/foursquare.meku766r/{z}/{x}/{y}.png',
  icon: '//s3-eu-west-1.amazonaws.com/cibulstatic/markerIcon.png'
};

module.exports = function( options ) {

  cn.extend( params, options ? options : {} );

  cn.addEvent( window, 'load', function() {

    var canvas = cn.el( params.selectors.canvas ),

    coords = _readCoords( canvas ),

    maps = mapLib({ url: params.tiles });

    maps.createMap( canvas, {
      center: coords, 
      onReady: function( map ) {

        maps.createMarker( map, {
          position: coords,
          icon: params.icon
        });

      },
      zoom: 14
    } );

  });

}

function _readCoords( canvas ) {

  var attr = canvas.getAttribute( params.attributes.coord ),

  coords = attr.split('|');

  return [ parseFloat( coords[0] ), parseFloat( coords[1] ) ];

}
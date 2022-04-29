var cn = require( '../../js/lib/common' ),

mapLib = require( '../../js/lib/osm.maps' ),

params = {
  selectors: {
    canvas: '.js_map'
  },
  attributes: {
    coord: 'data-coord',
    tiles: 'data-tiles'
  },
  icon: '//s3-eu-west-1.amazonaws.com/cibulstatic/markerIcon.png',
  scrollWheelZoom: false
};

module.exports = function( options ) {
  cn.extend( params, options ? options : {} );

  const canvas = cn.el(params.selectors.canvas);

  if (!canvas) return;

  const coords = _readCoords(canvas);

  const maps = mapLib({
    url: canvas.getAttribute('data-tiles')
  });

  maps.createMap(canvas, {
    center: coords,
    scrollwheel: params.scrollWheelZoom,
    onReady: function( map ) {

      maps.createMarker( map, {
        position: coords,
        icon: params.icon,
        anchor: [ 9, 25 ]
      });

    },
    zoom: 14
  } );

}

function _readCoords( canvas ) {

  var attr = canvas.getAttribute( params.attributes.coord ),

  coords = attr.split('|');

  return [ parseFloat( coords[0] ), parseFloat( coords[1] ) ];

}

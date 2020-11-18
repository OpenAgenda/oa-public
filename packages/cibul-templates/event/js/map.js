var cn = require( '../../js/lib/common/common.mod.js' ),

mapLib = require( '../../js/lib/maps/osm.maps.mod' ),

params = {
  selectors: {
    canvas: '.js_map'
  },
  attributes: {
    coord: 'data-coord'
  },
  tiles: '//api.mapbox.com/styles/v1/kaore/ckhn90pz00mut19pi1pt29nhi/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1Ijoia2FvcmUiLCJhIjoidDZ1UW5HWSJ9.VspmN8kRdEgRm2A91RjNow',
  icon: '//s3-eu-west-1.amazonaws.com/cibulstatic/markerIcon.png',
  scrollWheelZoom: false
};

module.exports = function( options ) {

  cn.extend( params, options ? options : {} );

  var canvas = cn.el( params.selectors.canvas ),

  coords = _readCoords( canvas ),

  maps = mapLib({ url: params.tiles });

  maps.createMap( canvas, {
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

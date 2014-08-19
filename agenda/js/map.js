var cn = require('../../js/lib/common/common.mod.js'),

mapLib = require('../../js/lib/maps/osm.maps.mod');

module.exports = function( options ) {

  var params = cn.extend( {
    selectors: {
      canvas: '.js_map_widget'
    }
  }, options ? options : {} );

  cn.addEvent( window, 'load', function() {

    var points = [
      [ 48.8705187,2.3821144 ],
      [ 48.875489, 2.357297 ],
      [ 48.860866, 2.346397 ],
      [ 48.867020, 2.364164 ],
      [ 48.874472, 2.362619 ],
      [ 48.872440, 2.406907 ],
      [ 48.872835, 2.399440 ]
    ];

    var center = [],

    canvas = cn.el( params.selectors.canvas );

    var maps = mapLib({ url: 'http://{s}.tiles.mapbox.com/v3/foursquare.meku766r/{z}/{x}/{y}.png' }),

    map = maps.createMap( canvas, {
      center: points[0], 
      onReady: function( map ) {

        cn.forEach( points, function( point ) {

          maps.createMarker( map, {
            position: point,
            icon: '//s3-eu-west-1.amazonaws.com/cibulstatic/markerIcon.png'
          });

        });

      },
      zoom: 14
    } );

  });

}
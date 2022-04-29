"use strict";

if ( typeof L === 'undefined' ) {

  require( 'leaflet' );

}

var maps = require( './maps' ),

utils = require( '@openagenda/utils' );

require( '@openagenda/leaflet.markercluster' );

maps.register('osm', (function(){

  var libOptions;

  return {

    init: function( options ) {

      libOptions = utils.extend({
        url: 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        attr: 'Map data © OpenStreetMap contributors',
      }, options?options:{});

    },

    createMap: function(mapElt, options) {

      options = utils.extend({
        zoom: 15,
        draggable: true,
        scrollwheel: true,
        keyboard: true,
        onReady: false
      }, options);

      var map = L.map(mapElt, {
        dragging: options.draggable,
        scrollWheelZoom: options.scrollwheel,
        keyboard: options.keyboard,
        maxZoom: 18
      });

      map.on('load', function() {
        setTimeout(() => {
          map.invalidateSize();
        }, 0);
      });

      if (options.onReady) map.on('load', function() {
        options.onReady(map);
      });

      try {
        map.setView(options.center, options.zoom);
      } catch( e ) {
        console.log( 'test env map load fail' );
      }

      L.tileLayer(libOptions.url, {
        minZoom: 2,
        maxZoom: 18,
        attribution: libOptions.attr,
        tileSize: 512,
        zoomOffset: -1,
        detectRetina: true
      }).addTo(map);

      return map;
    },

    createMarker: function( map, options ) {

      if ( arguments.length == 1 ) {

        options = map;

        map = false;

      }

      var icon = {},

      marker,

      count = typeof options.count == 'undefined' ? 1 : options.count;

      if (options.icon) {

        icon.iconUrl = options.icon;

        if ( options.anchor ) icon.iconAnchor = L.point( options.anchor );

        icon = L.icon(icon);

      } else {

        icon = new L.Icon.Default();

      }

      marker = L.marker(options.position, {
        title: options.title,
        icon: icon,
        draggable: options.draggable ? options.draggable : false,
        count: count
      })

      if ( map ) {

        marker.addTo(map);

      }

      return marker;

    },

    setOnMarkerClick: function(marker, callback) {

      marker.on('click', callback);

    },

    setOnBoundsChangeEnd: function(map, callback) {

      var getBounds = function() {

        callback(map.getBounds());

      };

      map.on('zoomend', getBounds);
      map.on('dragend', getBounds);
      map.on('resize', getBounds);

      return getBounds;

    },

    unsetOnBoundsChangeEnd: function(map, reference) {

      map.off('zoomend', reference);
      map.off('dragend', reference);
      map.off('resize', reference);

    },

    setOnMarkerEvent: function(marker, event, callback) {

      marker.on(event, callback);

    },

    setMarkerIcon: function(marker, options) {

      var osmOptions = {iconUrl: options.icon};

      if (options.anchor) osmOptions.iconAnchor = L.point(options.anchor);

      if (options.size) osmOptions.iconSize = options.size;

      marker.setIcon(L.icon(osmOptions));

    },

    setMarkerZIndex: function(marker, zIndex) {

      marker.setZIndexOffset(zIndex);

    },

    setMarkerPosition: function(marker, position) {

      marker.setLatLng(new L.LatLng(position[0], position[1]));

    },

    getBounds: function(map) {

      return map.getBounds();

    },

    createBounds: function(pos, options) {

      options = utils.extend({
        padding: 0.001
      }, options?options:{});

      return new L.LatLngBounds(new L.LatLng(parseFloat(pos[0])-options.padding, parseFloat(pos[1])-options.padding), new L.LatLng(parseFloat(pos[0])+options.padding, parseFloat(pos[1])+options.padding));

    },

    extendBounds: function( bounds, pos, options ) {

      var params = utils.extend( {
        padding: 0.001
      }, typeof options === 'undefined' ? options : {} );

      // extend to the north-east
      bounds.extend( new L.LatLng( parseFloat( pos[0] ) + params.padding, parseFloat( pos[1] ) + params.padding ) );

      // extend to the south-west
      bounds.extend( new L.LatLng( parseFloat( pos[0] ) - params.padding, parseFloat( pos[1] ) - params.padding ) );

    },

    fitBounds: function(map, bounds) {

      // this only works if map is not in display none

      if (!map.getSize().x) return;

      map.fitBounds(bounds);

    },

    getBoundsNorthEast: function(bounds) {

      return [bounds.getNorthEast().lat, bounds.getNorthEast().lng];

    },

    getBoundsSouthWest: function(bounds) {

      return [bounds.getSouthWest().lat, bounds.getSouthWest().lng];

    },

    createPopup: function(map, content, options) {

      if ( !map.getSize().x ) return;

      options = utils.extend({
        marker: false
      }, options?options:{});

      if (!options.marker) throw new Exception('this fonctionnality is not available if not attached to a marker');

      options.marker.bindPopup(content).openPopup();

      return options.marker;

    },

    createCluster: function( map, markers ) {

      var clusterGroup = L.markerClusterGroup({
        showCoverageOnHover: false
      });

      if ( markers ) clusterGroup.addLayers( markers );

      map.addLayer( clusterGroup );

      return clusterGroup;

    },

    clearClusterLayers: function( cluster ) {

      cluster.clearLayers();

    },

    addClusterLayers: function( cluster, markers ) {

      cluster.addLayers( markers );

    },

    removePopup: function(reference) {

      reference.closePopup();

    },

    getPosition: function( marker ) {

      var pos = marker.getLatLng();

      return [pos.lat, pos.lng];
    },

    setZoom: function(map, value) {

      map.setZoom(value);

    },

    getZoom: function(map) {

      return map.getZoom();

    },

    setCenter: function(map, position) {

      position = new L.LatLng(position[0], position[1]);

      map.panTo(position);

    },

  };

})());

module.exports = function( options ) {

  return maps.use( 'osm', options );

}

maps.register('google', (function(){

  var defaultStyle = [
    {
      "featureType": "road.highway",
      "elementType": "geometry.fill",
      "stylers": [
        { "weight": 1.3 },
        { "color": "#b5b5b5" }
      ]
    },{
      "featureType": "road.highway",
      "elementType": "labels.icon",
      "stylers": [
        { "visibility": "off" }
      ]
    },{
      "featureType": "road.arterial",
      "elementType": "geometry",
      "stylers": [
        { "visibility": "on" },
        { "color": "#ffffff" }
      ]
    },{
      "featureType": "road.arterial",
      "elementType": "labels.text",
      "stylers": [
        { "visibility": "on" },
        { "weight": 0.1 }
      ]
    },{
      "featureType": "road.highway",
      "elementType": "geometry.stroke",
      "stylers": [
        { "color": "#d8d8da" }
      ]
    },{
      "featureType": "road.highway",
      "elementType": "labels.text.stroke",
      "stylers": [
        { "color": "#ffffff" }
      ]
    },{
    }
  ];

  return {
    createMap: function(mapElt, options) {

      var options = extend({
        type: google.maps.MapTypeId.ROADMAP,
        zoom: 15,
        center: [0,0],
        rotateControl: false,
        panControl: false,
        streetViewControl: false,
        mapTypeControl: false,
        scrollwheel: true,
        draggable: true,
        keyboard: true,
        onReady: false
      }, options);

      var map = new google.maps.Map(mapElt, extend(options, {
        center: new google.maps.LatLng(options.center[0], options.center[1]),
        mapTypeId: options.type,
        styles: defaultStyle,
        keyboardShortcuts: options.keyboard
      }));

      if (options.onReady) google.maps.event.addListenerOnce(map, 'idle', function() {

        options.onReady(map);

      });

      return map;
    },

    createMarker: function(map, options) {

      var options = extend({
        map: map,
        draggable: false
      }, options);

      options.position = new google.maps.LatLng(options.position[0], options.position[1]);

      if (options.anchor) options.anchorPoint = new google.maps.Point(options.anchor[0], options.anchor[1]);

      return new google.maps.Marker(options);

    },

    setOnMarkerClick: function(marker, callback) {

      google.maps.event.addListener(marker, 'click', callback);

    },

    setOnBoundsChangeEnd: function(map, callback) {

      var getBounds = function() {

        callback(map.getBounds());

      };

      return [
        google.maps.event.addListener(map, 'dragend', getBounds),
        google.maps.event.addListener(map, 'zoom_changed', getBounds),
        google.maps.event.addListener(map, 'resize', getBounds)
      ];

    },

    unsetOnBoundsChangeEnd: function(map, reference) {

      forEach(reference, function(listener) {
        google.maps.event.removeListener(listener);
      });

    },

    setOnMarkerEvent: function(marker, event, callback) {

      google.maps.event.addListener(marker, event, callback);

    },

    setMarkerPosition: function(marker, position) {

      marker.setPosition(new google.maps.LatLng(position[0], position[1]));

    },

    setMarkerIcon: function(marker, options) {

      var gOptions = { url: options.icon };

      if (options.anchor) gOptions.anchor = new google.maps.Point(options.anchor[0], options.anchor[1]);

      marker.setIcon(gOptions);

    },

    createBounds: function(pos, options) {

      options = extend({
        padding: 0.001
      }, options?options:{});

      return new google.maps.LatLngBounds(new google.maps.LatLng(parseFloat(pos[0])-options.padding,parseFloat(pos[1])-options.padding), new google.maps.LatLng(parseFloat(pos[0])+options.padding, parseFloat(pos[1]) + options.padding));

    },

    extendBounds: function(bounds, position) {

      bounds.extend(new google.maps.LatLng(position[0], position[1]));

    },

    fitBounds: function(map, bounds) {

      map.fitBounds(bounds);

    },

    getBoundsNorthEast: function(bounds) {

      return [bounds.getNorthEast().lat(), bounds.getNorthEast().lng()];

    },

    getBoundsSouthWest: function(bounds) {

      return [bounds.getSouthWest().lat(), bounds.getSouthWest().lng()];

    },

    getBounds: function(map) {

      return map.getBounds();

    },

    createPopup: function(map, content, options) {

      options = extend({
        marker: false
      }, options?options:{});

      if (!options.marker) throw new Exception('this fonctionnality is not available if not attached to a marker');

      var infoWindow = new google.maps.InfoWindow({
        content: content
      });

      infoWindow.open(map, options.marker);

      return infoWindow;

    },

    removePopup: function(reference) {

      if (reference) reference.close();

    },

    getPosition: function(marker) {

      var position = marker.getPosition();

      return [position.lat(), position.lng()];

    },

    setZoom: function(map, value) {

      map.setZoom(value);

    },

    getZoom: function(map) {

      return map.getZoom();

    },

    setCenter: function(map, position) {

      map.setCenter(new google.maps.LatLng(position[0], position[1]));

    }

  };
  
})());
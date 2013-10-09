var mapHandler = function(m, mapElt, locations, params) {

  params = extend({
    events: {
      triggeredEvents: { 
        onLocationSelect: 'onlocationselect',   /* when marker of location is clicked */
        onBoundsChange: 'onboundschange',       /* when the bounds of the map change */
        getParams: 'getlistparams'
      },
      triggerEvents: { 
        selectLocation: 'selectlocation'        /* to know when selection of location has been made */, 
        unselectLocation: 'unselectlocation', 
        enable: 'enableMap', 
        disable: 'disableMap',
        changeBounds: 'changebounds'            /* to know when new bounds are requested */
      }
    },
    states: [
      { values: { enabled: true, highlighted: true }, icon: 'markerIcon.png', anchor: [9, 25] },
      { values: { enabled: true, highlighted: false }, icon: 'smallMarkerIcon.png', anchor: [3, 3] },
      { values: { enabled: false, highlighted: true }, icon: 'markerIconGray.png', anchor: [9, 25] },
      { values: { enabled: false, highlighted: false}, icon: 'smallMarkerIconGray.png', anchor: [3, 3] }
    ],
    defaultStates: {
      enabled: true,
      highlighted: true,
    },
    iconRoot: 'images/'
  }, params);

  var map, eh = sEventHandler.getInstance(), bounds, enabled = true, lockBoundEvents = false, ne, sw, boundsListener,

  init = function() {

    // if there aren't any locations, do not even display the map
    
    if (!locations.length) return;

    map = m.createMap(mapElt, { center: [locations[0].latitude, locations[0].longitude], keyboard: false });

    setLocations(locations);

    // setup interfaces through event handler

    if (params.events.triggerEvents.selectLocation) eh.on(params.events.triggerEvents.selectLocation, _focusOnLocationById);

    if (params.events.triggerEvents.unselectLocation) eh.on(params.events.triggerEvents.unselectLocation, _unsetFocus);

    if (params.events.triggerEvents.enable) eh.on(params.events.triggerEvents.enable, function(data) {

      if (data.neLat && data.neLng && data.swLat && data.swLng) _changeBounds(data);

      _enable();

    });

    if (params.events.triggerEvents.enable) eh.on(params.events.triggerEvents.disable, _disable);

    addEvent(window, 'resize', function(){
      setTimeout(_unsetFocus, 50);
    });

    return {
      setLocations: setLocations
    };

  },
  setLocations = function(locations, setBounds) {

    if (typeof setBounds == 'undefined') setBounds = true;

    bounds = false;

    forEach(locations, function(location) {

      // set locations default states

      for (state in params.defaultStates) 
        if (location[state] == undefined) location[state] = params.defaultStates[state];

      // create marker

      var markerOptions = _getMarkerOptions(location);

      location.marker = m.createMarker(map, { 
        position: [location.latitude, location.longitude],
        icon: markerOptions.icon,
        anchor: markerOptions.anchor,
        title: location.placename
      });

      // adjust bounds

      if (location.highlighted) 
        bounds?m.extendBounds(bounds, [location.latitude, location.longitude]):(bounds = m.createBounds([location.latitude, location.longitude]));
      

      // throw event on click with corresponding location
      if (params.events.triggeredEvents.onLocationSelect) m.setOnMarkerClick(location.marker, function() {

        if (!enabled) return;

        eh.trigger(params.events.triggeredEvents.onLocationSelect, location);

        _focusOnMarker(location.marker);

      });

    });

    if (!bounds) bounds = m.createBounds([locations[0].latitude, locations[0].longitude]);

    m.fitBounds(map, bounds);

  },

  _onBoundsChange = function(bounds) {

    // do not trigger anything if bounds are too similar than previous set

    var newBounds = {
      ne: m.getBoundsNorthEast(bounds),
      sw: m.getBoundsSouthWest(bounds)
    };

    newBounds = {
      ne: [Math.round(newBounds.ne[0]*1000)/1000, Math.round(newBounds.ne[1]*1000)/1000],
      sw: [Math.round(newBounds.sw[0]*1000)/1000, Math.round(newBounds.sw[1]*1000)/1000]
    };

    if (_areSameBounds(newBounds)) return;

    ne = newBounds.ne;
    sw = newBounds.sw;

    eh.trigger(params.events.triggeredEvents.onBoundsChange, { neLat: ne[0], neLng: ne[1], swLat: sw[0], swLng: sw[1] });

  },

  _changeBounds = function(bp) {

    var newBounds = {
      ne: [parseFloat(bp.neLat), parseFloat(bp.neLng)],
      sw: [parseFloat(bp.swLat), parseFloat(bp.swLng)]
    };

    if (_areSameBounds(newBounds)) return;

    if (boundsListener) {

      m.unsetOnBoundsChangeEnd(map, boundsListener);
      boundsListener = false;

    }

    ne = newBounds.ne;
    sw = newBounds.sw;

    var bounds = m.createBounds(ne);

    m.extendBounds(bounds, sw);

    m.fitBounds(map, bounds);

    boundsListener = m.setOnBoundsChangeEnd(map, _onBoundsChange);
    
  },

  _readBounds = function(bp) {

    if (!bp.neLat || !bp.neLng || !bp.swLat || !bp.swLng) return false;

    return {
      ne: [parseFloat(bp.neLat), parseFloat(bp.neLng)],
      sw: [parseFloat(bp.swLat), parseFloat(bp.swLng)]
    };

  },

  _areSameBounds = function(newBounds) {

    var sensitivity = 0.005;

    if (ne && sw 

    && (Math.abs(ne[0] - newBounds.ne[0]) < sensitivity) 

    && (Math.abs(ne[1] - newBounds.ne[1]) < sensitivity)

    && (Math.abs(sw[0] - newBounds.sw[0]) < sensitivity)

    && (Math.abs(sw[1] - newBounds.sw[1]) < sensitivity)) return true;

    return false;

  },

  _enable = function() {

    enabled = true;

    // enable click and change icon for all markers

    forEach(locations, function(location){

      location.enabled = true;

      m.setMarkerIcon(location.marker, _getMarkerOptions(location));

    });

    if (!boundsListener) boundsListener = m.setOnBoundsChangeEnd(map, _onBoundsChange);

  },
  _disable = function() {

    enabled = false;

    // disable click and change icon for all markers

    forEach(locations, function(location){

      location.enabled = false;

      m.setMarkerIcon(location.marker, _getMarkerOptions(location));

    });

    if (boundsListener) {
      m.unsetOnBoundsChangeEnd(map, boundsListener);
      boundsListener = false;
    }

  },
  _focusOnMarker = function(marker) {

    var markerBounds = m.createBounds(m.getPosition(marker), { padding: 0.005 });

    m.fitBounds(map, markerBounds);

  },
  _focusOnLocationById = function(id) {

    // find location

    forEach(locations, function(location) {
      if (location.id == id) {

        if (!location.marker) return;

        _focusOnMarker(location.marker);

        return;
      }
    });

  },
  _unsetFocus = function() {

    m.fitBounds(map, bounds);

  },
  _getMarkerOptions = function(location) {

    var options = false;

    forEach(params.states, function(state) {

      var match = true;

      for (name in state.values) {

        if (state.values[name] != location[name]) {
          match = false;
          break;
        }

      }

      if (match) {
        options = {
          icon: params.iconRoot + state.icon,
          anchor: state.anchor
        };
        return;
      } 

    });

    return options;

  };

  return init();

}
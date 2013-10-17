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

  var map, eh = sEventHandler.getInstance(), bounds, corners, boundsSynced, history, enabled = true, lockBoundEvents = false, ne, sw, boundsListener,

  init = function() {

    // if there aren't any locations, do not even display the map
    
    if (!locations.length) return;

    map = m.createMap(mapElt, { center: [locations[0].latitude, locations[0].longitude], keyboard: false });

    setLocations(locations);

    // setup interfaces through event handler

    if (params.events.triggerEvents.selectLocation) eh.on(params.events.triggerEvents.selectLocation, _focusOnLocationById);

    if (params.events.triggerEvents.unselectLocation) eh.on(params.events.triggerEvents.unselectLocation, function() {
      _syncBounds({restore: true});
    });

    if (params.events.triggerEvents.enable) eh.on(params.events.triggerEvents.enable, function(data) {

      if (data) {

        if (data.location) {

          _focusOnLocationById(data.location);

        } else if (history) {

          _syncBounds({restore: true});

        } else if (data && data.neLat && data.neLng && data.swLat && data.swLng) {

          _changeBounds(data);

        };

      }

      _enable();

    });

    if (params.events.triggerEvents.enable) eh.on(params.events.triggerEvents.disable, _disable);

    _enable();

    setTimeout(function() {
      m.setOnBoundsChangeEnd(map, _onBoundsChange);      
    }, 500);
    
    return {
      setLocations: setLocations
    };

  },
  setLocations = function(locations, setBounds) {

    if (typeof setBounds == 'undefined') setBounds = true;

    _updateCorners([locations[0].latitude, locations[0].longitude], {clear: true});

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

      if (location.highlighted) _updateCorners([location.latitude, location.longitude]);

      // throw event on click with corresponding location
      if (params.events.triggeredEvents.onLocationSelect) m.setOnMarkerClick(location.marker, function() {

        if (!enabled) return;

        eh.trigger(params.events.triggeredEvents.onLocationSelect, location);

        // not focusing on clicked marker before the result of the loaded list is received

      });

    });

    _syncBounds();

  },

  _onBoundsChange = function(bounds) {

    if (!enabled) return;

    // do not trigger anything if bounds are too similar than previous set

    var newCorners = {
      ne: m.getBoundsNorthEast(bounds),
      sw: m.getBoundsSouthWest(bounds)
    };

    newCorners = {
      ne: [Math.round(newCorners.ne[0]*1000)/1000, Math.round(newCorners.ne[1]*1000)/1000],
      sw: [Math.round(newCorners.sw[0]*1000)/1000, Math.round(newCorners.sw[1]*1000)/1000]
    };

    if (_areSameCorners(newCorners)) return;

    _updateCorners(newCorners.ne, {clear: true });
    _updateCorners(newCorners.sw, {synced: true });

    eh.trigger(params.events.triggeredEvents.onBoundsChange, { neLat: corners.ne[0], neLng: corners.ne[1], swLat: corners.sw[0], swLng: corners.sw[1] });

    _disable();

  },

  _changeBounds = function(bp) {

    var newCorners = {
      ne: [parseFloat(bp.neLat), parseFloat(bp.neLng)],
      sw: [parseFloat(bp.swLat), parseFloat(bp.swLng)]
    };

    if (_areSameCorners(newCorners)) return;

    _updateCorners(newCorners.ne, {clear: true});
    _updateCorners(newCorners.sw);

    _syncBounds();
    
  },

  _enable = function() {

    enabled = true;

    // enable click and change icon for all markers

    forEach(locations, function(location){

      location.enabled = true;

      m.setMarkerIcon(location.marker, _getMarkerOptions(location));

    });

  },

  _disable = function() {

    enabled = false;

    // disable click and change icon for all markers

    forEach(locations, function(location){

      location.enabled = false;

      m.setMarkerIcon(location.marker, _getMarkerOptions(location));

    });

  },

  _focusOnMarker = function(marker) {

    _updateCorners(m.getPosition(marker), { clear: true, history: true, fit: true });

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

  _readBounds = function(bp) {

    if (!bp.neLat || !bp.neLng || !bp.swLat || !bp.swLng) return false;

    return {
      ne: [parseFloat(bp.neLat), parseFloat(bp.neLng)],
      sw: [parseFloat(bp.swLat), parseFloat(bp.swLng)]
    };

  },


  _updateCorners = function(position, boundOptions) {

    if (typeof position[0] == 'string') position = [parseFloat(position[0]), parseFloat(position[1])];

    // bounds, corners, boundsSynced

    boundOptions = extend({
      clear: false,   // clear bounds
      history: false, // keep track of previous bounds
      synced: false,  // force sync value to true
      fit: false,      // fit map bounds to updated bounds
      restore: false
    }, boundOptions);

    if (boundOptions.history && corners) history = extend({}, {ne: corners.ne.slice(), sw: corners.sw.slice()});

    if (!corners || boundOptions.clear) {
      corners = {ne: [position[0], position[1]], sw: [position[0], position[1]]};
      boundsSynced = false;
    }

    if ((position[0] > corners.ne[0]) || (position[1] > corners.ne[1]) || (position[0] < corners.sw[0]) || (position[1] < corners.sw[1])) {

      boundsSynced = false;

      if (position[0] > corners.ne[0]) corners.ne[0] = position[0];
      if (position[1] > corners.ne[1]) corners.ne[1] = position[1];
      if (position[0] < corners.sw[0]) corners.sw[0] = position[0];
      if (position[1] < corners.sw[1]) corners.sw[1] = position[1];

    }

    if (boundOptions.synced) boundsSynced = true;

    if (boundOptions.fit) _syncBounds();

  },

  _syncBounds = function(syncOptions) {

    syncOptions = extend({
      restore: false
    }, syncOptions);

    if (syncOptions.restore && history) {

      corners = history;
      history = false;
      boundsSynced = false;

    }

    if (boundsSynced) return;

    bounds = m.createBounds(corners.ne);
    m.extendBounds(bounds, corners.sw);

    corners = {
      ne: m.getBoundsNorthEast(bounds),
      sw: m.getBoundsSouthWest(bounds)      
    };

    m.fitBounds(map, bounds);

    boundsSynced = true;

  },

  _areSameCorners = function(newCorners) {

    var sensitivity = 0.005;

    if ((Math.abs(corners.ne[0] - newCorners.ne[0]) < sensitivity) 

    && (Math.abs(corners.ne[1] - newCorners.ne[1]) < sensitivity)

    && (Math.abs(corners.sw[0] - newCorners.sw[0]) < sensitivity)

    && (Math.abs(corners.sw[1] - newCorners.sw[1]) < sensitivity)) return true;

    return false;

  },

  _unsetFocus = function() {

    _syncBounds({restore: true});

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
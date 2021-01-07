var mapHandler = function(m, locations, params) {

  params = extend({
    templates: {
      popup: '<div class="map-location"><% if (typeof image !== \'undefined\') { %><img src="<%= image %>"/><% } %><span><p><%= placename %></p><span><%= address %></span></span></div>',
    },
    elems: {
      map: false,
      search: false
    },
    events: {
      triggeredEvents: {
        onLocationSelect: 'onlocationselect',   /* when marker of location is clicked */
        onBoundsChange: 'onboundschange',       /* when the bounds of the map change */
        getParams: 'getlistparams'
      },
      triggerEvents: {
        selectLocation: 'selectlocation',       /* to know when selection of location has been made */
        unselectLocation: 'unselectlocation',
        enable: 'enableMap',
        disable: 'disableMap',
        changeBounds: 'changebounds',            /* to know when new bounds are requested */
        onEventOpen: 'oneventopen',
        onEventClose: 'oneventclose'
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
    iconRoot: 'images/',
    imagePath: '//cibul.s3.amazonaws.com/'
  }, params);

  var map,

  eh = sEventHandler.getInstance(), bounds, corners, boundsSynced, history, enabled = true, highlightedLocations = [], eventFocus = false, boundsEnabled = true,

  init = function() {

    // if there aren't any locations, do not even display the map
    
    if (!locations.length) return;

    map = m.createMap(params.elems.map, { center: [locations[0].latitude, locations[0].longitude], keyboard: false, onReady: function(map) {

      setTimeout(function() {
        m.setOnBoundsChangeEnd(map, _onBoundsChange);
      }, 10);

    }});
    
    setLocations(locations);

    // setup interfaces through event handler

    if (params.events.triggerEvents.selectLocation) eh.on(params.events.triggerEvents.selectLocation, _focusOnLocationById);

    if (params.events.triggerEvents.unselectLocation) eh.on(params.events.triggerEvents.unselectLocation, function() {
      
      _unhighlightLocation();
      _syncBounds({restore: true});
    });

    // check data given when map is enabled and set bounds

    if (params.events.triggerEvents.enable) eh.on(params.events.triggerEvents.enable, function(data) {

      eventFocus = false;

      if (data) {

        _unhighlightLocation();

        if (data.location) {

          // change bounds to location only if bounds are not manually set
          _focusOnLocationById(data.location, !(data.neLat && data.neLng && data.swLat && data.swLng));

        } else if (history) {

          _syncBounds({restore: true});

        } else if (data && data.neLat && data.neLng && data.swLat && data.swLng) {

          _changeBounds(data);

        };

      }

      _enable();

    });

    if (params.events.triggerEvents.enable) eh.on(params.events.triggerEvents.disable, _disable);

    if (params.events.triggerEvents.onEventOpen) eh.on(params.events.triggerEvents.onEventOpen, _eventFocus);

    if (params.events.triggerEvents.onEventClose) eh.on(params.events.triggerEvents.onEventClose, _eventUnfocus);

    _enable();

    if (params.elems.search && locations.length > 10) mapSearchHandler({
      classes: {
        contextMenu: 'context-menu wsq',
      },
      labels: params.labels,
      canvas: params.elems.search,
      locations: locations,
      onLocationSelect: function(locationId) {

        eh.trigger(params.events.triggeredEvents.onLocationSelect, {id: locationId});

      },
      onSelect: function(newCorners) { 

        _unhighlightLocation();

        _changeBounds(newCorners);

      }
    });
    
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

    if (!enabled || eventFocus || !boundsEnabled) return;

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

    _updateCorners(newCorners.ne, { clear: true });
    _updateCorners(newCorners.sw, { synced: true });

    var searchParams = { neLat: corners.ne[0], neLng: corners.ne[1], swLat: corners.sw[0], swLng: corners.sw[1] };

    if (!highlightedLocations.length) searchParams.location = null;

    eh.trigger(params.events.triggeredEvents.onBoundsChange, searchParams);

    _disable();

  },

  _changeBounds = function(newCorners) {

    if (newCorners.neLat)
      newCorners = { ne: [newCorners.neLat, newCorners.neLng], sw: [newCorners.swLat, newCorners.swLng] };
      
    newCorners = {ne: [parseFloat(newCorners.ne[0]), parseFloat(newCorners.ne[1])], sw: [parseFloat(newCorners.sw[0]), parseFloat(newCorners.sw[1])]};

    if (_areSameCorners(newCorners)) return;

    _updateCorners(newCorners.ne, { clear: true });
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

  _focusOnLocationById = function(id, focus) {

    focus = (typeof focus == 'undefined')?true:focus;

    // find location

    for (var i = locations.length - 1; i >= 0; i--) {
      if (locations[i].id == id) {

        if (!locations[i].marker) return console.log('location has no marker');

        if (focus) _focusOnMarker(locations[i].marker);

        _highlightLocation(i);

        break;

      }
    };

  },

  _highlightLocation = function(locationIndex) {

    var renderData = extend({}, locations[locationIndex]);

    if (locations[locationIndex].image) renderData.image = params.imagePath + locations[locationIndex].image;

    locations[locationIndex].popup = m.createPopup(map, new EJS({text: params.templates.popup}).render(renderData), { marker: locations[locationIndex].marker });

    highlightedLocations.push(locationIndex);

  },

  _unhighlightLocation = function(locationIndex) {

    var _unhighlight = function(index) {

      if (!locations[index].popup) return;

      m.removePopup(locations[index].popup);

      locations[index].popup = undefined;

    };

    if (typeof locationIndex == 'undefined') {

      while (highlightedLocations.length)
        _unhighlight(highlightedLocations.pop());

    } else {

      // look for that id and take it out

      for (var i = highlightedLocations.length - 1; i >= 0; i--) {
        if (highlightedLocations[i]==locationIndex) {
          
          highlightedLocations.splice(i, 1);

          _unhighlight(locationIndex);

          break;
        }
      };

    }

  },

  _eventFocus = function(data) {

    var clear = true, uid = '' + data.uid;

    eventFocus = true;

    // loop through locations and pick the ones that match event

    forEach(locations, function(location) {

      if (contains(location.events, uid)) {

        _updateCorners([location.latitude, location.longitude], {clear: clear, history: clear});

        clear = false;
      }

    });

    _syncBounds();

  },

  _eventUnfocus = function() {

    eventFocus = false;

    if (history) _syncBounds({restore: true});

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

    var boundOptions = extend({
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

    // for some reason this doesn't work sometimes
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
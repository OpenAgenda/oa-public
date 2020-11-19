var handlePlaceSelectionMap = function(params) {

  params = extend({
    canvas: false, // required;
    templates: {
      main: '<div class="js_selection_map selection-map"></div><div class="js_marker_info"></div>',
      info: '<div class="suggestion"><span class="name"><%= name %></span><span class="address"><%= address %></span><span class="js_actions actions"></span></span></div>',
      action: '<a href="#" class="action"><% if (icon) { %><i class="<%= icon %>"></i><% } %><% if (label) { %><span><%= label %></span><% } %></a>'
    },
    selectors: {
      map: '.js_selection_map',
      info: '.js_marker_info',
      actions: '.js_actions'
    },
    labels: {
      select: 'select'
    },
    actions: [
      { name: 'select', icon: 'icon-arrow-right', label: 'select' }
    ],
    onSelect: false,
    map: {
      type: 'osm',
      init: { url: '//api.mapbox.com/styles/v1/kaore/ckhn90pz00mut19pi1pt29nhi/tiles/{z}/{x}/{y}?access_token=pk.eyJ1Ijoia2FvcmUiLCJhIjoidDZ1UW5HWSJ9.VspmN8kRdEgRm2A91RjNow' },
      coords: [48.447052, 1.486754]
    },
    icon: 'images/markerIcon.png',
    defaultZoom: 13
  }, params);

  var elem, mapElem, infoElem, map, markers = [], mapLib,

  init = function() {

    mapLib = maps.use(params.map.type);

    if (!elem) createElem();

    if (!map) _createMap();

  },

  set = function(selection, options) {

    if (!elem) createElem();

    if (!map) _createMap();

    _clearMarkers();

    var bounds = false;

    forEach(selection, function(item) {

      var marker = mapLib.createMarker(map, {
        position: [item.lat, item.lng],
        icon: params.icon
      });

      mapLib.setOnMarkerClick(marker, function() {

        mapLib.setCenter(map, mapLib.getPosition(marker));

        _displayInfo(item);

        if (params.onSelect) params.onSelect('defaultselect', item);

      });

      if (bounds)
        mapLib.extendBounds(bounds, mapLib.getPosition(marker));
      else
        bounds = mapLib.createBounds(mapLib.getPosition(marker));

      markers.push(marker);

    });


    if (options && options.highlight) {

      _displayInfo(options.highlight);

      mapLib.setCenter(map, [options.highlight.lat, options.highlight.lng]);

    } else {

      mapLib.fitBounds(map, bounds);

    }

  },

  _displayInfo = function(item) {

    infoElem.innerHTML = new EJS({ text: params.templates.info }).render(item);

    forEach(params.actions, function(action) {

      el(infoElem, params.selectors.actions).appendChild(_createActionItem(item, action));

    });

  },

  _createMap = function() {

    map = mapLib.createMap(mapElem, { center: params.map.coords, tiles: params.map.init.url } );

  },

  _clearMarkers = function() {

    while (markers.length) {
      var markerToRemove = markers.pop();
      delete markerToRemove;
    }

  },

  createElem = function() {

    // create map, put it in

    elem = document.createElement('div');

    elem.innerHTML = new EJS({text: params.templates.main }).render();

    mapElem = el(elem, params.selectors.map);

    infoElem = el(elem, params.selectors.info);

    params.canvas.appendChild(elem);

  },

  removeElem = function() {

    if (!elem) return;

    _clearMarkers();

    map = undefined;

    while (child = childObject(elem, 0)) elem.removeChild(child);

    elem.parentNode.removeChild(elem);

    elem = mapElem = infoElem = false;

  },

  _createActionItem = function(item, action) {

    var actionCanvas = document.createElement('div');

    actionCanvas.innerHTML = new EJS({text: params.templates.action}).render(extend({}, action, {label: params.labels[action.label]}));

    addEvent(actionCanvas.childNodes[0], 'click', function(e) {

      preventDefault(e);

      if (params.onSelect) params.onSelect(action.name, item);

    });

    return actionCanvas.childNodes[0];

  };

  init();

  return {
    create: createElem,
    remove: removeElem,
    set: set
  };

};

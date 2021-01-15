var handlePlaceMapDrag = function(params) {

  params = extend({
    canvas: false, // required
    templates: {
      main: '<span><%= manualMarkDetail %></span><div class="js_drag_map selection-map"></div><div class="js_actions"><a class="js_select action" href="#"><i class="icon-arrow-right"></i><span><%= select %></span></a></div>',
    },
    selectors: {
      map: '.js_drag_map',
      select: '.js_select'
    },
    labels: {
      select: 'select',
      manualMarkDetail: 'type a location name and address and then adjust the marker to the desired location by drag and drop'
    },
    position: false,
    onSelect: false,
    map: {
      type: 'osm',
      init: {url: 'http://otile1.mqcdn.com/tiles/1.0.0/map/{z}/{x}/{y}.jpg'},
      coords: [48.447052, 1.486754],
    },
    icon: 'images/markerIcon.png'
  }, params);

  var elem, map, marker, position, mapLib,

  init = function() {

    mapLib = maps.use(params.map.type);

    if (!elem) _createElem();

  },

  set = function(selection) {

    if (selection.length)
      position = [selection[0].lat, selection[0].lng];
    else
      position = params.map.coords;

    if (!map) 
      _createMap();
    else
      _updateMarkerPosition();

  },

  _createElem = function() {

    elem = document.createElement('div');

    elem.innerHTML = new EJS({text: params.templates.main }).render(params.labels);

    mapElem = el(elem, params.selectors.map);

    params.canvas.appendChild(elem);

    addEvent(el(elem, params.selectors.select), 'click', function(e) {

      preventDefault(e);

      var latLng = mapLib.getPosition(marker);

      if (params.onSelect) params.onSelect('select', {lat: latLng[0], lng: latLng[1]});

    });

  },

  _removeElem = function() {

    if (!elem) return;

    delete marker;

    map = undefined;

    while (child = childObject(elem, 0)) elem.removeChild(child);

    elem.parentNode.removeChild(elem);

    elem = mapElem = false;

  },

  _createMap = function() {

    map = mapLib.createMap(mapElem, { center: position });

    marker = mapLib.createMarker(map, {
      position: position,
      draggable: true,
      icon: params.icon
    });

    mapLib.setOnMarkerEvent(marker, 'dragend', _markerPositionChange);

  },

  _updateMarkerPosition = function() {

    mapLib.setMarkerPosition(marker, position);

    mapLib.setCenter(map, position);

    _markerPositionChange()

  },

  _markerPositionChange = function() {

    var latLng = mapLib.getPosition(marker);

    if (params.onSelect) params.onSelect('defaultselect', {lat: latLng[0], lng: latLng[1]});

  };

  init();

  return {
    create: _createElem,
    remove: _removeElem,
    set: set
  }

};
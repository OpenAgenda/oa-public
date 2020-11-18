"use strict";

var utils = require( '@openagenda/utils' ),

du = require( '../../../js/lib/domUtils' ),

mapLib = require( '../../../js/lib/maps/osm.maps.mod' );

module.exports = function(params) {

  params = utils.extend({
    canvas: false, // required;
    templates: {
      main: '<div class="js_selection_map selection-map"></div><div class="js_marker_info"></div>',
      info: '<div class="suggestion"><span class="name"><%= name %></span><span class="address"><%= address %></span><span class="js_actions actions"></span></span></div>',
      action: '<a href="#" class="button blue small"><%= label %></a>'
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
      { name: 'select', label: 'select' }
    ],
    onSelect: false,
    map: {
      type: 'osm',
      init: { url: '//api.mapbox.com/styles/v1/kaore/ckhn90pz00mut19pi1pt29nhi/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1Ijoia2FvcmUiLCJhIjoidDZ1UW5HWSJ9.VspmN8kRdEgRm2A91RjNow' },
      coords: [48.447052, 1.486754]
    },
    icon: 'images/markerIcon.png',
    defaultZoom: 13
  }, params);

  var elem, mapElem, infoElem, map, markers = [], m,

  init = function() {

    if( !m ) m = mapLib( params.map.init );

    if (!elem) createElem();

    if (!map) _createMap();

  },

  set = function(selection, options) {

    if (!elem) createElem();

    if (!map) _createMap();

    _clearMarkers();

    var bounds = false;

    utils.forEach(selection, function(item) {

      var marker = m.createMarker(map, {
        position: [item.lat, item.lng],
        icon: params.icon
      });

      m.setOnMarkerClick(marker, function() {

        m.setCenter(map, m.getPosition(marker));

        _displayInfo(item);

        if (params.onSelect) params.onSelect('defaultselect', item);

      });

      if (bounds)
        m.extendBounds(bounds, m.getPosition(marker));
      else
        bounds = m.createBounds(m.getPosition(marker));

      markers.push(marker);

    });


    if (options && options.highlight) {

      _displayInfo(options.highlight);

      m.setCenter(map, [options.highlight.lat, options.highlight.lng]);

    } else {

      m.fitBounds(map, bounds);

    }

  },

  _displayInfo = function(item) {

    infoElem.innerHTML = params.templates.info(item);

    utils.forEach(params.actions, function(action) {

      du.el(infoElem, params.selectors.actions).appendChild(_createActionItem(item, action));

    });

  },

  _createMap = function() {

    map = m.createMap(mapElem, { center: params.map.coords, tiles: params.map.init.url } );

  },

  _clearMarkers = function() {

    while (markers.length) {

      var markerToRemove = markers.pop();

      markerToRemove = undefined;

    }

  },

  createElem = function() {

    // create map, put it in

    elem = document.createElement('div');

    elem.innerHTML = params.templates.main();

    mapElem = du.el(elem, params.selectors.map);

    infoElem = du.el(elem, params.selectors.info);

    params.canvas.appendChild( elem );

  },

  removeElem = function() {

    var child;

    if (!elem) return;

    _clearMarkers();

    map = undefined;

    while (child = du.childObject( elem, 0 )) elem.removeChild( child );

    elem.parentNode.removeChild( elem );

    elem = mapElem = infoElem = false;

  },

  _createActionItem = function(item, action) {

    var actionCanvas = document.createElement('div');

    actionCanvas.innerHTML = new EJS({text: params.templates.action}).render(utils.extend({}, action, {label: params.labels[action.label]}));

    du.addEvent(actionCanvas.childNodes[0], 'click', function(e) {

      du.preventDefault(e);

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

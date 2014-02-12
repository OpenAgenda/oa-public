var runMapBehavior = function(cHandler, sandboxResource, key, embedCode) {

  var autoWidth,
  mapWidthInput = el('.js_map_width'),
  mapTilesInput = el('.js_map_tiles'),
  mapStyle = {},
  mapElement = el('.js_map_preview'),
  eh = sEventHandler.getInstance(),

  run = function() {

    mapElement.src = sandboxResource + '?key=' + key;

    _initWidgets();

    cHandler.addChangeCallback(_updateMapElement);

  },

  _setEmbedStyle = function(values) {

    extend(mapStyle, values);

    var style = '';

    for (var index in mapStyle) {
      style += index + ':' + mapStyle[index] + '; ';
    }

    embedCode.set({style: style});

    mapElement.setAttribute('style', style);

    cibulEmbedWidget.controllers.map(mapElement);

  },

  _initWidgets = function() {

    new radioWidget('layout[mapautowidth]', function(name) {

      var mapAutoWidth = cHandler.get(name);

      autoWidth = mapAutoWidth;

      _setEmbedStyle({width: mapAutoWidth=='1'?'100%':mapWidthInput.value+'px'});

      return mapAutoWidth;

    }, function(name, value) {

      _setEmbedStyle({width: value=='1'?'100%':mapWidthInput.value+'px'});

      autoWidth = value;

      cHandler.set(name, value);

    });

    new textWidget('layout[mapwidth]', function(name) {

      var mapWidth = cHandler.get(name);

      if (autoWidth != '1' && mapWidth) _setEmbedStyle({width: mapWidth + 'px'});

      return mapWidth;

    }, function(name, value) {

      if (autoWidth=='1') return;

      _setEmbedStyle({width: value + 'px'});

      cHandler.set(name, value);

    });

    new textWidget('layout[mapheight]', function(name) {

      var mapHeight = cHandler.get(name);

      if (mapHeight) _setEmbedStyle({height: mapHeight + 'px'});

      return mapHeight;

    }, function(name, value) {

      _setEmbedStyle({height: value + 'px'});

      cHandler.set(name, value);

    });

    new textWidget('layout[maptiles]', function(name) {

      var mapTiles = cHandler.get(name);

      return mapTiles;

    }, function(name, value) {

      cHandler.set(name, value);

    });

  },

  _updateMapElement = function(newLayout) {

    var urlParams = extend({key: key}, newLayout);

    mapElement.setAttribute('src', sandboxResource.addUrlParameters(urlParams));

    loading = true;

    addEvent(mapElement, 'load', function() {
      
      if (mapElement.src.length) {

        loading = false;

        cibulEmbedWidget.controllers.map(mapElement);

      }
      
    });

  };

  run();

};
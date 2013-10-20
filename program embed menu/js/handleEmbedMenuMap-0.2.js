var runMapBehavior = function(cHandler, resource, key, embedCode) {

  var autoWidth,
  mapWidthInput = getElementsByClassName(document, 'js_map_width')[0],
  mapStyle = {},
  mapElement = getElementsByClassName(document, 'js_map_preview')[0],
  eh = sEventHandler.getInstance(),

  run = function() {

    mapElement.src = resource + '?key=' + key;

    _initWidgets();

  },
  _setEmbedCode = function(values) {

    extend(mapStyle, values);

    var style = '';

    for (index in mapStyle) {
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

      _setEmbedCode({width: mapAutoWidth=='1'?'100%':mapWidthInput.value+'px'});

      return mapAutoWidth;

    }, function(name, value) {

      _setEmbedCode({width: value=='1'?'100%':mapWidthInput.value+'px'});

      autoWidth = value; 

      cHandler.set(name, value, false);

    });

    new textWidget('layout[mapwidth]', function(name) {

      var mapWidth = cHandler.get(name);

      if (autoWidth != '1' && mapWidth) _setEmbedCode({width: mapWidth + 'px'});

      return mapWidth;

    }, function(name, value) {

      if (autoWidth=='1') return;

      _setEmbedCode({width: value + 'px'});

      cHandler.set(name, value, false);

    });

    new textWidget('layout[mapheight]', function(name) {

      var mapHeight = cHandler.get(name);

      if (mapHeight) _setEmbedCode({height: mapHeight + 'px'});

      return mapHeight;

    }, function(name, value) {

      _setEmbedCode({height: value + 'px'});

      cHandler.set(name, value, false);

    });

  };

  run();

};
var runMapBehavior = function(eh, cHandler, resource, key, embedScriptPath) {

  var autoWidth,
  mapWidthInput = getElementsByClassName(document, 'js_map_width')[0],
  mapStyle = {},
  mapElement = getElementsByClassName(document, 'js_map_preview')[0],
  initFrameCode = '<script type="text/javascript" src="' + embedScriptPath + '"></script><iframe class="cbpgmp" src="" style=""></iframe>',
  initSrc = resource + '?key=' + key,

  run = function() {

    mapElement.src = initSrc;

    _initWidgets();

  },
  _setEmbedCode = function(values) {

    var embedCodeElem = getElementsByClassName(document, 'js_map_code')[0];

    extend(mapStyle, values);

    var style = '';

    for (index in mapStyle) {
      style += index + ':' + mapStyle[index] + '; ';
    }

    embedCodeElem.value = initFrameCode.replace('src=""', 'src="' + initSrc + '"').replace('style=""', 'style="' + style + '"');

    embedCodeElem.removeAttribute('disabled');

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
var configHandler = function(config) {
  var changeCallback;

  if (Object.prototype.toString.call(config) != '[object Object]') {
    config = {};
  } else {
    var decoratedConfig = {};
    for (index in config) {
      decoratedConfig['layout[' + index + ']'] = config[index];
    }
    config = decoratedConfig;
  }

  configInputElem.value = JSON.stringify(config);

  return {
    get: function(name) {
      return config[name];
    },
    set: function(name, value, update) {

      if (typeof update == 'undefined') update = true;

      if (config[name] != value) {
        config[name] = value;

        configInputElem.value = JSON.stringify(config);

        if (changeCallback && update) changeCallback(config);
      }
      
    },
    getConfig: function() {
      return config;
    },
    setChangeCallback: function(callback) {
      changeCallback = callback;
    }
  }
},

runListBehavior = function(eh, cHandler, sandboxResource, listResource, key, embedScriptPath) {

  var listElement, toUpdateCss, updatedCss, loading = true,
  _run = function() {

    listElement = getElementsByClassName(document, 'js_list_embed')[0];
    listElement.src = sandboxResource + '?key=' + key;

    _setEmbedCode('js_list_code');

    _initWidgets();

    eh.on('iframeready', _syncCss);

    cHandler.setChangeCallback(_updateListElement);

    _updateListElement(cHandler.getConfig());

  },
  _setEmbedCode = function(className) {

    var embedCodeElem = getElementsByClassName(document, className)[0];

    embedCodeElem.removeAttribute('disabled');

  },
  _initWidgets = function() {

    setWidgets({
      set: cHandler.set,
      get: cHandler.get,
      widgets: {
        radio: ['layout[pres]'],
        select: ['layout[order]', 'layout[fontsize]', 'layout[fontfamily]', 'layout[epp]', 'layout[lang]'],
        text: ['layout[color1]', 'layout[color2]']
      }
    });

    new textareaWidget('customcss', cHandler.get, _updateCustomCss, {event: 'keyup'});

    // color pickers

    ColorPicker(
      document.getElementById('slide'),
      document.getElementById('picker'),
      function(hex, hsv, rgb) {
        getElementsByClassName(document, 'js_bgcolor')[0].setAttribute('value', hex);
        getElementsByClassName(document, 'js_color_indicator')[0].style.backgroundColor = hex;
        cHandler.set('layout[color1]', hex);
      }
    );

    handleContextMenu(getElementsByClassName(document, 'js_bgcolor')[0], getElementsByClassName(document, 'js_color_context')[0], eh);


    ColorPicker(
      document.getElementById('slide2'),
      document.getElementById('picker2'),
      function(hex, hsv, rgb) {
        getElementsByClassName(document, 'js_bgcolor')[1].setAttribute('value', hex);
        getElementsByClassName(document, 'js_color_indicator')[1].style.backgroundColor = hex;
        cHandler.set('layout[color2]', hex);
      }
    );

    handleContextMenu(getElementsByClassName(document, 'js_bgcolor')[1], getElementsByClassName(document, 'js_color_context')[1], eh);


    // canvas background

    ColorPicker(
      document.getElementById('slide3'),
      document.getElementById('picker3'),
      function(hex, hsv, rgb) {
        getElementsByClassName(document, 'js_bgcolor')[2].setAttribute('value', hex);
        getElementsByClassName(document, 'preview')[0].style.backgroundColor = hex;
        cHandler.set('layout[bgpreview]', hex);
      }
    );

    getElementsByClassName(document, 'preview')[0].style.backgroundColor = getElementsByClassName(document, 'js_bgcolor')[2].value;

    handleContextMenu(getElementsByClassName(document, 'js_bgcolor')[2], getElementsByClassName(document, 'js_color_context')[2], eh);
  },
  _syncCss = function() {

    if (toUpdateCss !== updatedCss) cHandler.set('layout[customcss]', toUpdateCss, false);
      
    updatedCss = toUpdateCss;

    listElement.contentWindow.window.setCustomCss(updatedCss);

  },
  _updateCustomCss = function(name, newCss) {

    toUpdateCss = newCss;

    if (!loading) _syncCss();

  },
  _updateListElement = function(newLayout) {

    var urlParams = extend({key: key}, newLayout);
    if (urlParams['layout[customcss]']) delete urlParams['layout[customcss]'];

    listElement.setAttribute('src', sandboxResource.addUrlParameters(urlParams));

    eh.trigger('iframeloading');

    loading = true;

    listElement.onload = function() {
      
      if (listElement.src.length) {

        cibulEmbedWidget.controllers.list(listElement);

        eh.trigger('iframeready');
        loading = false;

      }
    };

  };

  _run();

};
var configHandler = function(config) {
  var changeCallbacks = [];

  if (Object.prototype.toString.call(config) != '[object Object]') {
    config = {};
  } else {
    var decoratedConfig = {};
    for (var index in config) {
      decoratedConfig['layout[' + index + ']'] = config[index];
    }
    config = decoratedConfig;
  }

  return {
    get: function(name) {

      return config[name];

    },
    set: function(name, value, update) {

      if (typeof update == 'undefined') update = true;

      if (config[name] != value) {

        config[name] = value;

        if (changeCallbacks.length && update) {

          forEach(changeCallbacks, function(callback){
            callback(config);
          });
        }
      }
      
    },
    getConfig: function() {
      return config;
    },
    addChangeCallback: function(callback) {
      changeCallbacks.push(callback);
    }
  };
},

runListBehavior = function(cHandler, sandboxResource, key) {

  var params = {
    events: { cssUpdate: 'cssupdate', layoutUpdate: 'layoutupdate' },
  },

  listElement, toUpdateCss, updatedCss, loading = true,
  eh = sEventHandler.getInstance(),
  _run = function() {

    listElement = el('.js_list_embed');
    listElement.src = sandboxResource + '?key=' + key;

    _initWidgets();

    eh.on('iframeready', _syncCss);

    cHandler.addChangeCallback(_updateListElement);

    _updateListElement(cHandler.getConfig());

  },
  _initWidgets = function() {

    setWidgets({
      set: cHandler.set,
      get: cHandler.get,
      widgets: {
        radio: ['layout[pres]'],
        select: ['layout[order]', 'layout[fontsize]', 'layout[fontfamily]', 'layout[epp]', 'layout[lang]'],
        text: ['layout[color1]', 'layout[color2]', 'layout[color3]', 'layout[color4]', 'layout[linkcss]']
      }
    });

    new textareaWidget('customcss', cHandler.get, function(name, newCss) {
      _updateCustomCss(newCss);
      eh.trigger(params.events.cssUpdate, newCss);
    }, {event: 'keyup'});

    // color pickers

    _enableColorPicker(el('#slide'), el('#picker'), function(value) {
      els('.js_bgcolor')[4].setAttribute('value', value);
      els('.js_color_indicator')[0].style.backgroundColor = value;
      cHandler.set('layout[color1]', value);
    });

    handleContextMenu(els('.js_bgcolor')[4], els('.js_color_context')[4], eh);


    _enableColorPicker(el('#slide2'), el('#picker2'), function(value) {
      
      els('.js_bgcolor')[1].setAttribute('value', value);
      els('.js_color_indicator')[1].style.backgroundColor = value;
      cHandler.set('layout[color2]', value);

    });

    handleContextMenu(els('.js_bgcolor')[1], els('.js_color_context')[1], eh);


    _enableColorPicker(el('#slide3'), el('#picker3'), function(value) {
      
      els('.js_bgcolor')[2].setAttribute('value', value);
      els('.js_color_indicator')[2].style.backgroundColor = value;
      cHandler.set('layout[color3]', value);

    });

    handleContextMenu(els('.js_bgcolor')[2], els('.js_color_context')[2], eh);


    _enableColorPicker(el('#slide4'), el('#picker4'), function(value) {
      
      els('.js_bgcolor')[3].setAttribute('value', value);
      els('.js_color_indicator')[3].style.backgroundColor = value;
      cHandler.set('layout[color4]', value);

    });

    handleContextMenu(els('.js_bgcolor')[3], els('.js_color_context')[3], eh);


    _enableColorPicker(el('#backgroundslide'), el('#backgroundpicker'), function(value) {
      
      els('.js_bgcolor')[0].setAttribute('value', value);
      el('.preview').style.backgroundColor = value;
      cHandler.set('layout[bgpreview]', value);

    });

    el('.preview').style.backgroundColor = els('.js_bgcolor')[0].value;

    handleContextMenu(els('.js_bgcolor')[0], els('.js_color_context')[0], eh);
  },
  _enableColorPicker = function(slideElem, pickerElem, callback) {

    try {
      ColorPicker(
        slideElem,
        pickerElem,
        function(hex, hsv, rgb) {
          callback(hex);
        }
      );
    } catch (e) {
      console.log ('color picker error');
    }

  },
  _syncCss = function() {

    if (toUpdateCss !== updatedCss) cHandler.set('layout[customcss]', toUpdateCss);
      
    updatedCss = toUpdateCss;

    listElement.contentWindow.window.setCustomCss(updatedCss);

  },
  _updateCustomCss = function(newCss) {

    toUpdateCss = newCss;

    if (!loading) _syncCss();

  },

  /**
   * reset list frame src attribute with passed layout parameters (css excluded)
  **/
  _updateListElement = function(newLayout) {

    var urlParams = extend({key: key}, newLayout);
    if (urlParams['layout[customcss]']) delete urlParams['layout[customcss]'];

    eh.trigger(params.events.layoutUpdate, newLayout);

    listElement.setAttribute('src', sandboxResource.addUrlParameters(urlParams));

    eh.trigger('iframeloading');

    loading = true;

    addEvent(listElement, 'load', function() {
      
      if (listElement.src.length) {

        loading = false;

        cibulEmbedWidget.controllers.list(listElement);

        eh.trigger('iframeready');

      }
      
    });

  };

  _run();

};
var cibulEventLocation = function(params) {

  params = extend({
    canvas: false,
    countries: false,
    lang: 'en',
    events: {
      fetch: 'elocationfetch',
      send: 'elocationsend',
      remove: 'elocationremove',
      heightChange: 'heightchange',
      languageChange: 'elanguageschange',
      fetchLanguages: 'elanguagesfetch',
      sessionFetch: 'getsessiondata',
      clear: 'eventclear'
    },
    templates: {
      main: '<h2><%= locationTitle %></h2><p><%= locationInfo %></p><div class="js_places"></div>',
      add: '<div class="js_add_place"><button><%= addPlace %></button><div class="separator"></div></div>'
    },
    selectors: {
      addPlace: '.js_add_place',
      places: '.js_places'
    },
    classes: {
      addPlace: 'add-place'
    },
    labels: {
      addPlace: 'add a place',
      locationTitle: 'Place',
      dateTitle: 'Dates',
      change:'change',
      remove: 'remove'
    },
    get: false,
    map: {
      type: 'osm',
      init: {url: 'http://otile1.mqcdn.com/tiles/1.0.0/map/{z}/{x}/{y}.jpg'},
      coords: [48.447052, 1.486754]
    },
    icon: 'images/markerIcon.png',
    sessionData: false,
    localSelection: [] // local locations to choose from
  }, params);

  var eh = sEventHandler.getInstance(),

  elem, addLink, locationHandlers = {}, languages, country, callbackIds = [],

  init = function() {

    _createElement();

    _getSessionData(function(data) {

      country = _findCountry(data.country);

      eh.trigger(params.events.fetchLanguages, function(newLanguages) {

        // languages are required for pricing info which are linked to locations
        languages = newLanguages;

        // loop through existing locations and create forms.

        _createLocationHandlers(function() {
          
          if (!Object.size(locationHandlers)) {
            _addLocation();
          }

        });

        _on(params.events.languageChange, function(newLanguages) {

          languages = newLanguages;

          for (var index in locationHandlers) {
            locationHandlers[index].updateLanguages(languages);
          }

        });

        _on(params.events.clear, function() {

          // unregister methods
          forEach(callbackIds, function(id) { 
            eh.cancel(id);
          });

        });

      });

    });

  },

  _on = function(eventName, callback) {

    callbackIds.push(eh.on(eventName, callback));

  },

  _getSessionData = function(callback) {

    if (!params.sessionData) {

      eh.trigger(params.events.sessionFetch, callback);

    } else {

      callback(params.sessionData);

    }

  },

  _createLocationHandlers = function(index, callback) {

    var data = {};

    if (typeof index == 'function') {

      callback = index;

      index = false;

    }

    eh.trigger(params.events.fetch, extend({ callback: function(response) {

      if (!response) return callback();

      _createLocationHandler(response);

      if (response.nextIndex)
        _createLocationHandlers(response.nextIndex, callback);
      else
        callback();

    }}, index===false?{}:{index: index}));

  },

  _createLocationHandler = function(data) {

    var index = data.index;

    locationHandlers[index] = handleEventPlaceEdit({
      labels: params.labels,
      lang: params.lang,
      countries: params.countries,
      country: country,
      languages: languages,
      canvas: el(elem, params.selectors.places),
      locationData: data.location?data.location:false,
      get: params.get,
      locations: params.localSelection,
      onHeightChange: function() {
        eh.trigger(params.events.heightChange);
      },
      onChange: function(location) {

        _notifyLocationChange(index, location);
        
      },
      onRemove: function() {

        _notifyLocationRemove(index);

        delete locationHandlers[index];

        // if this is the last location of the form, a blank form should appear
        if (!Object.size(locationHandlers)) _addLocation();

      },
      onComplete: function() {
      },
      map: params.map,
      icon: params.icon
    });

  },

  _notifyLocationChange = function(index, location) {

    eh.trigger(params.events.send, { index: index, location: location });

  },

  _notifyLocationRemove = function(index) {

    eh.trigger(params.events.remove, { index: index });

  },

  _notifyLocationAdd = function(callback) {

    eh.trigger(params.events.send, { location: {}, callback: callback });

  },

  _createElement = function() {

    elem = document.createElement('div');

    elem.innerHTML = new EJS({ text: params.templates.main }).render(params.labels);

    params.canvas.appendChild(elem);

  },

  _addLocation = function() {

    _notifyLocationAdd(function(newIndex) {

      _createLocationHandler({index: newIndex});

    });

  },

  _findCountry = function(code) {

    for (var i = params.countries.length - 1; i >= 0; i--)
      if (code == params.countries[i].code) return params.countries[i];

    return { code: 'FR', name: 'France' };

  };

  init();

};
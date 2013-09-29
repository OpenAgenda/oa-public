var cibulEvent = function(params) {

  params = extend({
    event: {},
    events: {
      log: 'log',
      description: {
        fetch: 'edescriptionfetch',
        write: 'edescriptionfieldsend',
        remove: 'edescriptionfieldremove'
      },
      location: {
        fetch: 'elocationfetch',
        remove: 'elocationremove',
        write: 'elocationsend',
      },
      image: {
        fetch: 'eimagefetch',
        remove: 'eimageremove',
        write: 'eimagesend'
      },
      uidfetch: 'euidfetch',
      validate: 'evalidate',
      fetchEncoded: 'efetchencoded',
      languageChange: 'elanguageschange',
      fetchLanguages: 'elanguagesfetch'
    },
    descriptionFields: ['title', 'description', 'tags', 'freeText']

  }, params);

  var eh = sEventHandler.getInstance(),

  validator = cibulEventValidator({labels: params.labels}),

  nextLocationIndex = 0,
  locationMap = {},

  event = params.event, onValidate = false, languages = [],

  init = function() {

    if (Object.prototype.toString.call(event) === '[object Array]') event = {};

    if (!event.locations) event.locations = [];

    _mapLocations();

    _updateLanguages();

    eh.on(params.events.log, function() {
      console.log(event);
    });

    eh.on(params.events.description.fetch, function(callback) {

      callback({
        title: event.title,
        description: event.description,
        tags: event.tags,
        freeText: event.freeText
      });

    });

    eh.on(params.events.description.write, function(data) {

      var error = null;

      try {

        _validate(data.name, data.value);

      } catch (e) {

        error = e;

      };

      if (!event[data.name]) event[data.name] = {};

      if (!event[data.name][data.language]) event[data.name][data.language] = {};

      event[data.name][data.language] = data.value;

      if (data.callback) data.callback(error);

      _evaluate();

      _updateLanguages();

    });

    eh.on(params.events.description.remove, function(data) {

      forEach(params.descriptionFields, function(fieldName) {

        if (!event[fieldName] || typeof event[fieldName][data.language] == 'undefined') return;

        delete event[fieldName][data.language];

      });

      _evaluate();

      _updateLanguages();

    });

    eh.on(params.events.location.fetch, function(data) {

      var index = data.index;

      if (typeof index == 'undefined') index = _getFirstLocationIndex();

      if (index === false) return data.callback(false);

      data.callback({
        location: locationMap[index],
        index: index,
        nextIndex: _getNextLocationIndex(index)
      });

    });

    eh.on(params.events.location.write, function(data) {

      if (isDef(data.index)) {

        locationMap[parseInt(data.index,10)] = data.location;

      } else {

        var newLocation = data.location;

        event.locations.push(newLocation);

        var newIndex = _mapLocation(newLocation);

        if (data.callback) data.callback(newIndex);

      }

      _printLocationMap();

      _evaluate();

    });

    eh.on(params.events.location.remove, function(data) {

      if (data.index && locationMap[data.index]) delete locationMap[data.index];

      _printLocationMap();

      _evaluate();

    });

    eh.on(params.events.image.fetch, function(callback) {

      callback(event.image?{image: event.image }:false);

    });

    eh.on(params.events.image.remove, function() {

      event.image = false;

      _evaluate();

    });

    eh.on(params.events.image.write, function(data) {

      if (data.image) event.image = data.image;

      _evaluate();

    });

    eh.on(params.events.uidfetch, function(callback) {

      callback({uid: event.uid?event.uid:false, draft: event.draft?true:false });

    });

    eh.on(params.events.validate, function(callbacks) {

      onValidate = callbacks.onChange;

      _evaluate(callbacks.onSuccess);

    });

    eh.on(params.events.fetchEncoded, function(callback) {

      callback(JSON.stringify(event));

    });

    eh.on(params.events.fetchLanguages, function(callback) {
      callback(languages);
    });

  },

  _printLocationMap = function() {

    while (event.locations.length) {
      var discardedLocation = event.locations.pop();
      delete discardedLocation;
    }
      

    var index;

    for (index in locationMap) {

      event.locations.push(locationMap[index]);

    }

  },

  /**
   * map event locations to indexes that will be used to fetch them
   **/

  _mapLocations = function() {

    forEach(event.locations, function(location) {

      _mapLocation(location);

    });

  },

  _mapLocation = function(location) {

    var index = nextLocationIndex;

    locationMap[nextLocationIndex] = location;

    nextLocationIndex++;

    return index;

  },

  _getFirstLocationIndex = function() {

    var index;

    for (index in locationMap)
      return index;

    return false;

  },

  _getNextLocationIndex = function(currentIndex) {

    var nextIndex = false, index, currentFound = false, currentIndex = parseInt(currentIndex);

    for (index in locationMap) {

      if (currentFound) {

        nextIndex = index;
        break;

      } else if (index == currentIndex) {

        currentFound = true;

      }

    }

    return nextIndex;

  },

  _validate = function(field, value) {

    validator.process(field, value);

  },

  _evaluate = function(onSuccess) {

    if (onValidate || onSuccess) _validateEvent(function(success, errors) {

      if (success && onSuccess) onSuccess();

      if (onValidate) onValidate(success, errors);

    });

  },

  _validateEvent = function(callback) {

    var errors = validator.processFull(event);

    callback(errors.length?false:true, errors);

  },

  _updateLanguages = function() {

    var newLanguages = [];

    forEach(params.descriptionFields, function(fieldName) {

      if (isDef(event[fieldName])) 
        for (var lang in event[fieldName])
          if (!contains(newLanguages, lang)) newLanguages.push(lang);

    });

    // compare with existing

    if (!_compareArrays(newLanguages, languages)) {
      
      // they are different
      languages = newLanguages;
      eh.trigger(params.events.languageChange, languages);
    }

  },

  //http://stackoverflow.com/questions/7837456/comparing-two-arrays-in-javascript
  _compareArrays = function(a, b) {

    // if the other array is a falsy value, return
    if (!a) return false;

    // compare lengths - can save a lot of time
    if (b.length != a.length) return false;

    for (var i = 0; i < b.length; i++) {
      // Check if we have nested arrays
      if (b[i] instanceof Array && a[i] instanceof Array) {
        // recurse into the nested arrays
        if (!b[i].compare(a[i]))
          return false;
      }
      else if (b[i] != a[i]) {
        // Warning - two different object instances will never be equal: {x:20} != {x:20}
        return false;
      }
    }
    return true;
  }

  init();

}
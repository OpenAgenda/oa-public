var handleEventPlaces = function(controlData, m, options) {

  var eh = sEventHandler.getInstance(),
    options = extend({
      displayNoneClass: 'display-none',
      iconRoot: 'images/'
    }, options),
    events = {
      triggeredEvents: extend({onLocationSelect: 'eventmaplocationselect', onLocationSelectCancel: 'eventmaplocationunselect'}, options.triggeredEvents ),
      triggerEvents: extend({ selectLocation: 'eventlocationselectexternal' }, options.triggerEvents )
    }

  , run = function() {

    // get locations from event control data, create map and place the corresponding markers

    var locations = _extractLocations(controlData);

    if (!locations.length) return;

    var mHandler = mapHandler(m, locations, { events: {
      triggeredEvents: {onLocationSelect: events.triggeredEvents.onLocationSelect },
      triggerEvents: { selectLocation: events.triggerEvents.selectLocation, unselectLocation: events.triggeredEvents.onLocationSelectCancel },
    }, iconRoot: options.iconRoot, elems: { map: options.mapElem }});


    if (locations.length != 1) {

      _showGeneralInfo(locations);

      eh.on(events.triggeredEvents.onLocationSelect, _showLocationInfo);

      eh.on(events.triggerEvents.selectLocation, function(locationId){
        _showLocationInfo(_findLocation(locations, locationId));
      });

      eh.on(events.triggeredEvents.onLocationSelectCancel, function(){
        _showGeneralInfo(locations);
      });

      addEvent(options.showAllElem, 'click', function(e){
        
        preventDefault(e);

        eh.trigger(events.triggeredEvents.onLocationSelectCancel);

      });

    }

  },
  _showLocationInfo = function(location) {

    if (!location) return;

    var ejs = new EJS({ text: options.template });

    options.locationElem.innerHTML = ejs.render(location);

    options.locationTitleElem.innerHTML = location.placename;

    removeClass(options.locationTitleElem.parentNode, options.displayNoneClass);

  },
  _showGeneralInfo = function(locations) {

    options.locationTitleElem.innerHTML = '';

    addClass(options.locationTitleElem.parentNode, options.displayNoneClass);

    options.locationElem.innerHTML = options.generalInfoText.replace('%d', locations.length);

  },
  _extractLocations = function(data) {

    var locations = []
      , today = new Date()
      , allPassed = true;

    for (slug in data.l) {

      var location = data.l[slug];

      locations.push({
        id: slug,
        placename: location.p,
        address: location.a,
        ticketLink: location.l,
        latitude: location.lt,
        longitude: location.lg,
        highlighted: false
      });

      if (location.t) locations[locations.length-1].pricingInfo = location.t;

      forEach(location.o, function(o) {
        if (today <= new Date(o.d + ' ' + o.s)) {
          locations[locations.length-1].highlighted = true;
          allPassed = false;
        }
      });

    };

    if (allPassed) forEach(locations, function(location) {
      location.highlighted = true;
    });

    return locations;

  },
  _findLocation = function(locations, locationId) {

    var found = false;

    forEach(locations, function(location){
      if (location.id == locationId) {
        found = location;
        return;
      }
    });

    return found;

  };

  run();

};
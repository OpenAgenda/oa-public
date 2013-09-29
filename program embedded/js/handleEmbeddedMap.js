var handleEmbeddedMap = function(options) {

  options = extend({
    mapElem: false,       // map element. required
    maps: 'osm',           // which map library is to be used
    control: false,       // control data resource
    events: {
      markerSelect: 'markerselect',                 // triggered when a marker is clicked
      locationSelect: 'locationselect',             // triggered when focus is set on a specific location
      locationSelectCancel: 'locationselectcancel', // triggered when focus on location is removed
      loadSuccess: 'loadsuccess',                   // triggered from exterior, when new list load is successful 
      disable: 'disable',                           // triggered to disable the map
      enable: 'enable',                             // triggered to enable the map
      load: 'load'
    },
    iconRoot: 'images/'
  }, options);

  var m, eh = sEventHandler.getInstance(),


  _init = function() {

    // open map library
    m = options.maps=='google'?maps.use('google'):maps.use('osm', {url: 'http://otile1.mqcdn.com/tiles/1.0.0/map/{z}/{x}/{y}.jpg'});

    // extract location data from control data
    _extractLocationData(options.control, function(locations) {

      // create the map handler, give it the extracted locations
      var mHandler = mapHandler(m, options.mapElem, locations, { events: {
        triggeredEvents: {onLocationSelect: options.events.markerSelect },
        triggerEvents: { selectLocation: options.events.locationSelect, unselectLocation: options.events.locationSelectCancel, disable: options.events.markerSelect, enable: options.events.loadSuccess },
      }, iconRoot: options.iconRoot });

    });

    eh.on(options.events.markerSelect, function(location) {
      eh.trigger(options.events.load, {location: location.id});
    });

  },

  _extractLocationData = function(control, callback) {

    handleProgramControlData([extractLocation], function(controlData, processedData) {

      var data = processedData[0];

      var locations = []
      , today = new Date()
      , allPassed = true;

      for (slug in data) {

        var location = data[slug];
       
        locations.push({
          id: slug,
          placename: location.placename,
          address: location.address,
          latitude: location.lat,
          longitude: location.lng,
          highlighted: false
        });

        forEach(location.dates, function(date) {
          if (today <= new Date(date)) {
            locations[locations.length-1].highlighted = true;
            allPassed = false;
          }
        });

      };

      if (allPassed) forEach(locations, function(location) {
        location.highlighted = true;
      });

      callback(locations);

    }, control);

  };

  _init();

};
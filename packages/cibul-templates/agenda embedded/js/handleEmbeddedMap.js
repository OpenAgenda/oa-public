var handleEmbeddedMap = function(options) {

  options = extend({
    mapElem: false,       // map element. required
    searchElem: false,     // location search field element
    maps: 'osm',           // which map library is to be used
    control: false,       // control data resource
    search: false,
    iconRoot: 'images/',
    enabled: false,
    tiles: '//api.mapbox.com/styles/v1/mapbox/streets-v11/tiles/{z}/{x}/{y}?access_token=pk.eyJ1Ijoia2FvcmUiLCJhIjoidDZ1UW5HWSJ9.VspmN8kRdEgRm2A91RjNow'
  }, options);

  options.events = extend({
    markerSelect: 'markerselect',                 // triggered when a marker is clicked
    locationSelect: 'locationselect',             // triggered when focus is set on a specific location
    locationSelectCancel: 'locationselectcancel', // triggered when focus on location is removed
    loadSuccess: 'loadsuccess',                   // triggered from exterior, when new list load is successful
    disable: 'disable',                           // triggered to disable the map
    enable: 'enable',                             // triggered to enable the map
    load: 'load',
    onBoundsChange: 'onboundschange',
    onEventOpen: 'oneventopen',
    onEventClose: 'oneventclose'
  }, isDef(options.events)?options.events:{});

  var m, eh = sEventHandler.getInstance(),


  _init = function() {

    // open map library
    m = options.maps=='google'?maps.use('google'):maps.use('osm', {url: options.tiles});

    // extract location data from control data
    _extractLocationData(options.control, function(locations) {

      // create the map handler, give it the extracted locations
      var mHandler = mapHandler(m, locations, { events: {
        triggeredEvents: { onLocationSelect: options.events.markerSelect, onBoundsChange: options.events.onBoundsChange },
        triggerEvents: { selectLocation: options.events.locationSelect, unselectLocation: options.events.locationSelectCancel, disable: options.events.markerSelect, enable: options.events.loadSuccess, onEventOpen: options.events.onEventOpen, onEventClose: options.events.onEventClose },
      }, iconRoot: options.iconRoot, labels: options.labels, elems: { map: options.mapElem, search: options.searchElem } });

    });

  },

  _extractLocationData = function(control, callback) {

    handleProgramControlData([extractLocation], function(controlData, processedData) {

      var data = processedData[0];

      var locations = [],
      today = new Date(),
      allPassed = true;

      for (var slug in data) {

        var location = data[slug];

        locations.push({
          id: slug,
          placename: location.placename,
          address: location.address,
          latitude: location.lat,
          longitude: location.lng,
          highlighted: false,
          upcoming: 0,
          events: location.events
        });

        forEach(location.dates, function(date) {
          if (today <= new Date(date)) {
            locations[locations.length-1].highlighted = true;
            locations[locations.length-1].upcoming++;
            allPassed = false;
          }
        });

        forEach(['image', 'city', 'country'] , function(optional) {
          if (location[optional]) locations[locations.length-1][optional] = location[optional];
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

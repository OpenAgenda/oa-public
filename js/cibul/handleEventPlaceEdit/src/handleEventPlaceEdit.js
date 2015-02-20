var handleEventPlaceEdit = function(params) {

  params = extend({
    canvas: false,
    country: {code: 'FR', name: 'France'},
    templates: {
      main: '<div class="js_place place"></div><div class="js_pricing pricing form-section cform"><h2><%= pricingTitle %></h2></div><div class="js_dates dates form-section"><h2><%= dateTitle %></h2></div><div class="separator"></div>',
      info: '<div class="title"><%= name %></div><div class="address"><%= address %></div><a href="#" class="action js_change"><i class="icon-edit"></i><span><%= changeLabel %></span></a>',
    },
    selectors: {
      info: '.js_place',
      placeForm: '.js_place',
      dates: '.js_dates',
      pricing: '.js_pricing',
      change: '.js_change',
      remove: '.js_remove'
    },
    classes: {
      edit: 'embed-menu form-section'
    },
    locationData: false,
    labels: {
      locationTitle: 'Place',
      locationInfo: false,
      pricingTitle: 'Pricing',
      dateTitle: 'Dates',
      change:'change',
      fetchInfo: 'Type the name and address and select you location from the list',
      placename: 'Name',
      placenameInfo: 'Name of the place',
      address: 'Address',
      addressInfo: 'street number, street name, city, country',
      noPlaceName: 'The name is missing.',
      noAddress: 'The address is missing.',
      noLatLng: 'Geographical data is missing. Please reselect a location from the list.',
      incompletePlace: 'The place information is incomplete.',
      languages: {
        en: 'english',
        fr: 'français',
        es: 'espanol',
        it: 'italiano'
      },
      countryField: 'country name',
      countryFieldInfo: 'type in a country name and click or press enter'
    },
    get: false, // remote get function to use
    locations: [], // locally available location data
    onRemove: false,
    onChange: false,
    onHeightChange: false, // callback for when the height of the element changes
    onComplete: false,
    languages: [],
    initLocationCount: 5,
    lang: 'en',
    map: {
      type: 'osm',
      init: {url: '//{s}.tiles.mapbox.com/v3/foursquare.meku766r/{z}/{x}/{y}.png'},
      coords: [48.447052, 1.486754]
    },
    icon: 'images/markerIcon.png'
  }, params);

  var location = {}, // this is the current location handled by this script

  dates = [], elem, infoElem, placeSelector, pricingSelector, placeFetch, dateSelector, languages = params.languages,

  _run = function() {

    if (params.locationData) {
      location = params.locationData;
      dates = params.locationData.dates?params.locationData.dates:[];
    }

    _createElem();

    // if there is location data, show the info menu. Else show the selection menu.

    if (Object.size(location)) {
      _updateInfo(location);
    } else {
      _showPlaceSelection();
    }

    _showPricingSelection(location);

    _showDateSelection();

  },

  _updateInfo = function(locationInfo) {

    if (!infoElem) { 

      infoElem = document.createElement('div');

      el(elem, params.selectors.info).appendChild(infoElem);

    }

    var child;

    while (child = childObject(infoElem, 0)) infoElem.removeChild(child);

    infoElem.innerHTML = new EJS({text: params.templates.info }).render(extend({changeLabel: params.labels.change }, locationInfo));

    infoElem.style.display = 'block';

    addEvent(el(infoElem, params.selectors.change), 'click', function(e) {

      preventDefault(e);

      _hideInfo();

      _showPlaceSelection();

    });

    removeClass(el(elem, params.selectors.placeForm), params.classes.edit);

    if (params.onHeightChange) params.onHeightChange();

  },

  /**
   * run locally everytime there is a change in the location/dates/pricing
   * binds them and calls onChange and onComplete (only when location is effectively complete)
   **/

  _onChange = function() {

    extend(location, {dates: dates});

    if (params.onChange) params.onChange(location);

    _controlLocation(function(success) {

      if (success && dates.length && params.onComplete) params.onComplete(location);

    });

    if (params.onHeightChange) params.onHeightChange();

    
  },

  _hideInfo = function() {

    if (infoElem) infoElem.style.display = 'none';

  },

  /**
   * create place edit frame element
   */

  _createElem = function() {

    elem = document.createElement('div');

    elem.innerHTML = new EJS({text: params.templates.main }).render(params.labels);

    params.canvas.appendChild(elem);


  },

  /**
   * shows the menu for choosing a new location, including name and address
   * fields, selection lists.
   */

  _showPlaceSelection = function() {

    if (!placeFetch) {

      placeFetch = handlePlaceFetch({
        canvas: el(elem, params.selectors.placeForm),
        countries: params.countries,
        country: params.country,
        get: params.get,
        locations: params.locations,
        labels: params.labels,
        onFetched: function(suggestions) {
          
          if (placeSelector) placeSelector.set(suggestions);

        },
        onChange: function(values) {

          extend(location, values);

          _onChange();
          
        }
      }).create();

    } else {

      placeFetch.create();

    }

    if (!placeSelector) {

      placeSelector = handlePlaceSelection({
        canvas: el(elem, params.selectors.placeForm),
        labels: params.labels,
        map: params.map,
        icon: params.icon,
        onSelect: function(item) {

          _updateLocation(item);

          _controlLocation(function(success, message) {

            if (!success) return placeSelector.displayError(message);

            // this hereunder only when the place is valid

            placeSelector.remove();
            placeFetch.remove();

            placeSelector = placeFetch = undefined;

            _updateInfo(location);

            _onChange();

          });

        },
        onDefaultSelect: function(item) {

          _updateLocation(item);

          _onChange();

        },
        onHeightChange: params.onHeightChange
      });

      // show first 8 elements from preset locations if any

      if (params.locations.length) {
        var initLocations = [];
        for (var i=0; i<Math.min(params.initLocationCount, params.locations.length); i++)
          initLocations.push(params.locations[i]);

        placeSelector.set(initLocations);
      }

    } else {

      placeSelector.create();

    }

    addClass(el(elem, params.selectors.placeForm), params.classes.edit);

  },



  _showPricingSelection = function(location) {

    pricingSelector = handlePricingSelection({
      canvas: el(elem, params.selectors.pricing),
      location: location,
      labels: params.labels,
      languages: languages,
      onChange: function(ticketLink, pricingInfo) {

        location.ticketLink = ticketLink;
        location.pricingInfo = pricingInfo;

        _onChange();
      }
    });

  },


  /**
   * shows the menu listing dates
   */

  _showDateSelection = function() {

    var dateSelector = handleDateSelection({
      canvas: el(elem, params.selectors.dates),
      dates: dates,
      labels: params.labels,
      lang: params.lang,
      onChange: function(newDates) {
        
        dates = newDates;

        _onChange();

      },
      onHeightChange: params.onHeightChange
    });

    if (!dates.length) dateSelector.showAdd();

  },

  /**
   * makes some checks on location and callbacks with errors. If return list is empty then the location is fine.
   */

  _controlLocation = function(callback) {

    // if location is missing a name, an address, a latitude or a longitude, display message and return false

    var errorMessage = [];

    if (!location.name.length) errorMessage.push(params.labels.noPlaceName);
    if (!location.address.length) errorMessage.push(params.labels.noAddress);
    if (!location.lat || !location.lng) errorMessage.push(params.labels.noLatLng);

    if (errorMessage.length) errorMessage.splice(0,0, params.labels.incompletePlace);

    callback(errorMessage.length?false:true, errorMessage.join(' '));

  },

  _updateLocation = function(item) {

    if (location && location.uid) delete location.uid;

    location = extend(location?location:{}, item);

  },

  // update language set known to the handler

  updateLanguages = function(newLanguages) {

    languages = newLanguages;

    if (pricingSelector) pricingSelector.updateLanguages(newLanguages);

  };

  _run();

  return {
    updateLanguages: updateLanguages
  };

};
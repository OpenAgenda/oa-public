"use strict";

var utils = require( '@openagenda/utils' ),

du = require( '../../../js/lib/domUtils' ),

handlePlaceFetch = require( './handlePlaceFetch' ),

handlePlaceSelection = require( './handlePlaceSelection' ),

defaults = {
  canvas: false,
  country: {code: 'FR', name: 'France'},
  templates: {
    main: [
      '<div class="js_place place form-section"></div>',
      '<div class="separator"></div>'
    ].join( '' ),
    info: [
      '<a href="#" class="action js_change button blue change">',
        '<%= changeLabel %>',
      '</a>',
      '<div class="title"><%= name %></div>',
      '<div class="address"><%= address %></div>'
    ].join( '' )
  },
  selectors: {
    info: '.js_place',
    placeForm: '.js_place',
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
    init: {url: '//api.mapbox.com/styles/v1/mapbox/streets-v11/tiles/{z}/{x}/{y}?access_token=pk.eyJ1Ijoia2FvcmUiLCJhIjoidDZ1UW5HWSJ9.VspmN8kRdEgRm2A91RjNow'},
    coords: [48.447052, 1.486754]
  },
  icon: 'images/markerIcon.png'
}

module.exports = function( options ) {

  var params = utils.extend( {}, defaults, options ),

  location = {}, // this is the current location handled by this script

  elem, infoElem, placeSelector, pricingSelector, placeFetch, dateSelector, languages = params.languages,

  _run = function() {

    if ( params.locationData ) {

      location = params.locationData;

    }

    _createElem();

    // if there is location data, show the info menu. Else show the selection menu.

    if ( utils.size(location) ) {

      _updateInfo(location);

    } else {

      _showPlaceSelection();

    }

  },

  _updateInfo = function(locationInfo) {

    if (!infoElem) {

      infoElem = document.createElement('div');

      du.el( elem, params.selectors.info ).appendChild( infoElem );

    }

    var child;

    while ( child = du.childObject(infoElem, 0)) infoElem.removeChild(child);

    infoElem.innerHTML = params.templates.info(utils.extend({changeLabel: params.labels.change }, locationInfo));

    infoElem.style.display = 'block';

    du.addEvent(du.el(infoElem, params.selectors.change), 'click', function(e) {

      du.preventDefault(e);

      _hideInfo();

      _showPlaceSelection();

    });

    du.removeClass(du.el(elem, params.selectors.placeForm), params.classes.edit);

    if (params.onHeightChange) params.onHeightChange();

  },

  /**
   * run locally everytime there is a change in the location
   * binds them and calls onChange and onComplete (only when location is effectively complete)
   **/

  _onChange = function() {

    if ( params.onChange ) params.onChange( location );

    _controlLocation( function( success ) {

      if ( success && params.onComplete ) params.onComplete( location );

    } );

    if ( params.onHeightChange ) params.onHeightChange();


  },

  _hideInfo = function() {

    if (infoElem) infoElem.style.display = 'none';

  },

  /**
   * create place edit frame element
   */

  _createElem = function() {

    elem = document.createElement('div');

    elem.innerHTML = params.templates.main(params.labels);

    params.canvas.appendChild(elem);


  },

  /**
   * shows the menu for choosing a new location, including name and address
   * fields, selection lists.
   */

  _showPlaceSelection = function() {

    if (!placeFetch) {

      placeFetch = handlePlaceFetch({
        canvas: du.el( elem, params.selectors.placeForm ),
        countries: params.countries,
        country: params.country,
        url: params.url,
        locations: params.locations,
        labels: params.labels,
        onFetched: function( suggestions ) {

          if ( placeSelector ) placeSelector.set( suggestions );

        },
        onChange: function(values) {

          utils.extend(location, values);

          _onChange();

        }
      }).create();

    } else {

      placeFetch.create();

    }

    if (!placeSelector) {

      placeSelector = handlePlaceSelection({
        canvas: du.el(elem, params.selectors.placeForm),
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

    du.addClass(du.el(elem, params.selectors.placeForm), params.classes.edit);

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

    location = utils.extend(location?location:{}, item);

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

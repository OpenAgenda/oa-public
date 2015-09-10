"use strict";

var utils = require( 'utils' ),

rUtils = require( '../reactUtils' ),

du = require( '../../../js/lib/domUtils' ),

EJS = require( '../../../js/lib/clientEjs/ejs' ),

handleEventPlaceEdit = require( './handleEventPlaceEdit' );

module.exports = function( params ) {

  params = utils.extend({
    canvas: '.js_form_canvas_below',
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
    url: false,
    map: {
      type: 'osm',
      init: { url: '//{s}.tiles.mapbox.com/v3/foursquare.meku766r/{z}/{x}/{y}.png' },
      coords: [48.447052, 1.486754]
    },
    icon: 'images/markerIcon.png',
    sessionData: false,
    localSelection: [] // local locations to choose from
  }, params);

  var eh = rUtils.eh, 

  elem, addLink, locationHandler, languages, country, callbackIds = [],

  init = function() {

    _createElement();

    window.getSession( function( data ) {

      country = _findCountry( data.country );

      eh.trigger( params.events.fetchLanguages, function( newLanguages ) {

        // languages are required for pricing info which are linked to locations
        languages = newLanguages;

        _createLocationHandler();

        _on(params.events.clear, function() {

          // unregister methods
          utils.forEach( callbackIds, function(id) { 

            eh.cancel( id );

          });

        });

      });

    } );

  },

  _on = function(eventName, callback) {

    callbackIds.push(eh.on(eventName, callback));

  },

  _createLocationHandler = function() {

    eh.trigger( params.events.fetch, function( location, timings ) {

      locationHandler = handleEventPlaceEdit({
        labels: params.labels,
        lang: params.lang,
        countries: params.countries,
        country: country,
        languages: languages,
        canvas: du.el(elem, params.selectors.places),
        locationData: location ? utils.extend( {}, location, { timings: timings } ) : {},
        get: params.get,
        locations: params.localSelection,
        onChange: function(location) {

          _notifyLocationChange( location );
          
        },
        map: params.map,
        icon: params.icon
      });

    });

  },

  _notifyLocationChange = function( location ) {

    eh.trigger( params.events.send, location);

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

    du.el( params.canvas ).appendChild(elem);

  },

  _findCountry = function(code) {

    for (var i = params.countries.length - 1; i >= 0; i--)
      if (code == params.countries[i].code) return params.countries[i];

    return { code: 'FR', name: 'France' };

  };

  init();

};
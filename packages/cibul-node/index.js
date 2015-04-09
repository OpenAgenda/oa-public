"use strict";

var config = require( './config' ),

modelLib =  require( 'cibulModel' );

module.exports = {
  services: {
    location: require( './services/location/location' ),
    event: require( './services/event/event' ),
    agenda: require( './services/agenda/agenda' ),
    nominatim: require( './services/nominatim/nominatim' )
  },
  config: require( './config' ),
  modelLib: modelLib
};
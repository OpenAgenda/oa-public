"use strict";

var config = require( './config' ),

modelLib =  require( 'cibulModel' );

module.exports = {
  services: {
    location: require( './services/location/location' ),
    event: require( './services/event/event' ),
    agenda: require( './services/agenda/agenda' )
  },
  config: require( './config' ),
  modelLib: modelLib
};
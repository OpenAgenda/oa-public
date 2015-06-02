"use strict";

module.exports = {
  services: {
    location: require( './services/location' ),
    event: require( './services/event' ),
    agenda: require( './services/agenda/agenda' ),
    embed: require( './services/embed/embed' ),
    nominatim: require( './services/nominatim/nominatim' )
  },
  config: require( './config' ),
  modelLib: require( './services/model' )
};
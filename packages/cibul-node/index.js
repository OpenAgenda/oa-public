"use strict";

module.exports = {
  services: {
    location: require( './services/location/location' ),
    event: require( './services/event/event' ),
    agenda: require( './services/agenda/agenda' ),
    embed: require( './services/embed/embed' ),
    nominatim: require( './services/nominatim/nominatim' )
  },
  config: require( './config' ),
  modelLib: require( './services/model' )
};
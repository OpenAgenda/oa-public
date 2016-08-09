"use strict";

module.exports = {
  services: {
    location: require( './services/location' ),
    event: require( './services/event' ),
    agenda: require( './services/agenda' ),
    embed: require( './services/embed/embed' ),
    nominatim: require( './services/nominatim/nominatim' )
  },
  config: require( './config' ),
  init: require( './lib/init' ),
  modelLib: require( './services/model' )
};